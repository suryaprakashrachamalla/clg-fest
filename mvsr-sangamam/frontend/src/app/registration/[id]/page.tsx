import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MapPin, XCircle } from "lucide-react";
import { fetchCurrentUser, fetchRegistrationSlip } from "@/services/api";
import { fmtDate, fmtTime, formatINR } from "@/utils/format";
import { PendingActions, PrintButton, CopyButton } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your token" };

export default async function RegistrationPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await fetchCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/registration/${params.id}`)}`);

  const data = await fetchRegistrationSlip(params.id);
  if (!data) notFound();
  const { registration: reg, event, team, qrImage } = data;
  const token: string = team?.code ?? reg.code;

  return (
    <div className="container-x max-w-3xl py-10">
      {reg.status === "CONFIRMED" ? (
        <div className="no-print mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-200">
          <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">You&apos;re registered.</span> Show this token and QR code at the helpdesk on
            the fest day.
          </p>
        </div>
      ) : reg.status === "PENDING" ? (
        <div className="no-print mb-6 flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
          <Clock className="h-6 w-6 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">Payment pending.</span> Your slot is held for a few minutes. Complete the
            payment to get your token.
          </p>
        </div>
      ) : (
        <div className="no-print mb-6 flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">
          <XCircle className="h-6 w-6 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">This registration is {reg.status.toLowerCase()}.</span> No payment was
            taken for it. You can register again from the event page.
          </p>
        </div>
      )}

      <article className="panel print-card overflow-hidden">
        <div className="border-b border-white/10 p-6 sm:p-8">
          <p className="eyebrow">Sangamam 2026 · {event.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gold" aria-hidden />
              {fmtDate(event.startsAt)}, {fmtTime(event.startsAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold" aria-hidden />
              {event.venue}
            </span>
          </div>
        </div>

        {reg.status === "CONFIRMED" ? (
          <div className="grid gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {team ? "Team token" : "Registration token"}
              </p>
              <p className="mt-1 break-all font-mono text-3xl font-bold tracking-wider text-gold sm:text-4xl">{token}</p>
              {team && <p className="mt-1 text-sm text-zinc-500">Registration {reg.code}</p>}
              <div className="no-print mt-3">
                <CopyButton text={token} label="Copy token" />
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {team && <Field label="Team" value={team.name} />}
                <Field label={team ? "Team leader" : "Participant"} value={reg.fullName} />
                <Field label="College" value={reg.college} />
                <Field label="Amount paid" value={reg.amount === 0 ? "Free" : formatINR(reg.amount)} />
              </dl>
            </div>
            {qrImage && (
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrImage} alt={`QR code for ${token}`} className="h-44 w-44 rounded-xl bg-white p-2" />
                <p className="mt-2 text-xs text-zinc-500">Scanned at the entry gate</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Registration" value={reg.code} />
              {reg.teamName && <Field label="Team" value={reg.teamName} />}
              <Field label="Amount" value={formatINR(reg.amount)} />
            </dl>
            <div className="no-print mt-6">
              {reg.status === "PENDING" ? (
                <PendingActions registrationId={reg.id} />
              ) : (
                <Link href="/#events" className="btn-primary">
                  Back to events
                </Link>
              )}
            </div>
          </div>
        )}

        {reg.status === "CONFIRMED" && team && (
          <div className="border-t border-white/10 p-6 sm:p-8">
            <h2 className="text-lg font-semibold">
              Team members ({team.memberCount}/{team.paidCapacity})
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-zinc-300">
              {team.members.map((m: any) => (
                <li key={m.name + m.role}>
                  {m.name} <span className="text-zinc-500">· {m.role === "LEADER" ? "Leader" : "Member"}</span>
                </li>
              ))}
            </ul>
            {team.invitationCode && team.memberCount < team.paidCapacity && (
              <div className="no-print mt-5 rounded-xl border border-white/10 bg-night-800 p-4 text-sm">
                <p className="text-zinc-300">
                  Teammates join for free with invite code{" "}
                  <span className="font-mono font-semibold text-gold">{team.invitationCode}</span>.
                </p>
                {team.inviteLink && (
                  <div className="mt-3">
                    <CopyButton text={team.inviteLink} label="Copy invite link" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </article>

      <div className="no-print mt-6 flex flex-wrap justify-between gap-3">
        <Link href="/dashboard" className="btn-ghost">
          My registrations
        </Link>
        {reg.status === "CONFIRMED" && <PrintButton />}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-zinc-100">{value}</dd>
    </div>
  );
}
