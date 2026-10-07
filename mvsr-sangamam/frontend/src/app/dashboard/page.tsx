import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchCurrentUser, fetchDashboardData } from "@/services/api";
import { fmtDate, fmtTime, formatINR } from "@/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "My registrations" };

const STATUS: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: "Confirmed", cls: "badge-ok" },
  PENDING: { label: "Payment pending", cls: "badge-warn" },
  EXPIRED: { label: "Expired", cls: "badge-bad" },
  CANCELLED: { label: "Cancelled", cls: "badge-bad" },
  FAILED: { label: "Failed", cls: "badge-bad" },
};

export default async function DashboardPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const data = await fetchDashboardData();
  const registrations: any[] = data?.registrations ?? [];
  const memberships: any[] = data?.memberships ?? [];

  return (
    <div className="container-x max-w-4xl py-10">
      <p className="eyebrow">Hi {user.name?.split(" ")[0]}</p>
      <h1 className="mt-2 text-3xl font-bold">My registrations</h1>

      {registrations.length === 0 && memberships.length === 0 ? (
        <div className="panel mt-8 p-8 text-center">
          <p className="text-zinc-400">You haven&apos;t registered for any events yet.</p>
          <Link href="/#events" className="btn-primary mt-5">
            Browse events
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {registrations.map((r) => {
            const s = STATUS[r.status] ?? { label: r.status, cls: "badge-info" };
            return (
              <li key={r.id}>
                <Link
                  href={`/registration/${r.id}`}
                  className="card flex flex-wrap items-center justify-between gap-4 p-5 transition hover:border-gold/40"
                >
                  <div>
                    <p className="font-semibold text-white">{r.event.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {fmtDate(r.event.startsAt)}, {fmtTime(r.event.startsAt)} · {r.event.venue}
                    </p>
                    {r.team && <p className="mt-1 text-sm text-zinc-500">Team {r.team.name}</p>}
                  </div>
                  <div className="text-right">
                    <span className={s.cls}>{s.label}</span>
                    <p className="mt-2 font-mono text-sm text-gold">{r.status === "CONFIRMED" ? r.team?.code ?? r.code : r.code}</p>
                    <p className="text-xs text-zinc-500">{r.amount === 0 ? "Free" : formatINR(r.amount)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
          {memberships.map((m) => (
            <li key={`m-${m.id}`} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold text-white">{m.event.name}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {fmtDate(m.event.startsAt)}, {fmtTime(m.event.startsAt)} · {m.event.venue}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Member of team {m.teamName} (leader {m.leaderName})
                </p>
              </div>
              <div className="text-right">
                <span className="badge-ok">Joined</span>
                <p className="mt-2 font-mono text-sm text-gold">{m.teamCode}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
