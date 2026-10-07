import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, IndianRupee, MapPin, Trophy, Users } from "lucide-react";
import { getEvent, groupLabel } from "@/lib/events";
import { fetchCurrentUser } from "@/services/api";
import { feeLabel, fmtDate, fmtTime, formatINR, teamSizeLabel } from "@/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await getEvent(params.slug);
  return { title: event?.name ?? "Event" };
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const [event, user] = await Promise.all([getEvent(params.slug), fetchCurrentUser()]);
  if (!event) notFound();

  const full = event.remaining === 0;
  const canRegister = event.registrationOpen && !full;
  const registerHref = `/register/${event.slug}`;

  return (
    <div className="container-x py-10">
      <Link href="/#events" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All events
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="eyebrow">{groupLabel(event)}</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{event.name}</h1>
          <p className="mt-3 text-lg text-zinc-400">{event.tagline}</p>

          <p className="mt-8 whitespace-pre-line leading-relaxed text-zinc-300">{event.description}</p>

          {event.rules.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">Rules</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-300 marker:text-gold">
                {event.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {event.eligibility && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold">Eligibility</h2>
              <p className="mt-2 text-zinc-300">{event.eligibility}</p>
            </section>
          )}

          {event.prizes.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold">Prizes</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {event.prizes.map((p) => (
                  <li key={p.place} className="card flex items-start gap-3 p-4">
                    <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                    <div>
                      <p className="font-semibold text-white">{p.place}</p>
                      <p className="text-sm text-zinc-400">
                        {p.amount ? `${formatINR(p.amount)} · ` : ""}
                        {p.label}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {event.faqs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold">FAQ</h2>
              <div className="mt-3 space-y-2">
                {event.faqs.map((f) => (
                  <details key={f.q} className="card p-4">
                    <summary className="cursor-pointer font-medium text-white">{f.q}</summary>
                    <p className="mt-2 text-sm text-zinc-400">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {event.coordinators.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold">Coordinators</h2>
              <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                {event.coordinators.map((c) => (
                  <li key={c.name}>
                    {c.name}
                    {c.phone && <span className="text-zinc-500"> · {c.phone}</span>}
                    {c.email && <span className="text-zinc-500"> · {c.email}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-6">
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-gold" aria-hidden />
                {fmtDate(event.startsAt)}, {fmtTime(event.startsAt)} – {fmtTime(event.endsAt)}
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gold" aria-hidden />
                {event.venue}
              </li>
              <li className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gold" aria-hidden />
                {teamSizeLabel(event)}
              </li>
              <li className="flex items-center gap-3">
                <IndianRupee className="h-4 w-4 text-gold" aria-hidden />
                {feeLabel(event)}
              </li>
            </ul>
            {event.remaining !== null && (
              <p className="mt-4 text-xs text-zinc-500">
                {event.remaining} of {event.capacity} {event.participationType === "TEAM" ? "team" : ""} slots left
              </p>
            )}

            <div className="mt-6">
              {!canRegister ? (
                <button className="btn-ghost w-full py-3" disabled>
                  {full ? "Slots full" : "Registrations closed"}
                </button>
              ) : user ? (
                <Link href={registerHref} className="btn-primary w-full py-3">
                  Register
                </Link>
              ) : (
                <>
                  <Link href={`/login?next=${encodeURIComponent(registerHref)}`} className="btn-primary w-full py-3">
                    Register
                  </Link>
                  <p className="mt-3 text-center text-xs text-zinc-500">
                    You&apos;ll need to log in or{" "}
                    <Link href={`/signup?next=${encodeURIComponent(registerHref)}`} className="text-gold hover:underline">
                      sign up
                    </Link>{" "}
                    first.
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
