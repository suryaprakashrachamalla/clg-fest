"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/client";

type User = { name: string; email: string; phone: string; college: string; studentId: string };
type Lookup = {
  state: "VALID" | "INVALID" | "INACTIVE" | "FULL" | "EXPIRED";
  team: { name: string; code: string | null; leader: string; memberCount: number; paidCapacity: number; event?: { name: string } } | null;
};

const STATE_MSG: Record<string, string> = {
  INVALID: "That invite code doesn't exist. Check it with your team leader.",
  INACTIVE: "This team isn't accepting members right now.",
  FULL: "This team is already full.",
  EXPIRED: "This invite code has expired.",
};

export function JoinTeam({ initialCode, user }: { initialCode: string; user: User | null }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [form, setForm] = useState({ fullName: user?.name ?? "", phone: user?.phone ?? "", college: user?.college ?? "", studentId: user?.studentId ?? "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(c = code) {
    setError(null);
    setLookup(null);
    if (!c.trim()) return;
    setBusy(true);
    try {
      setLookup(await api<Lookup>(`/api/teams/lookup?code=${encodeURIComponent(c.trim())}`));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialCode) check(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await api("/api/teams/join", {
        code,
        participant: { ...form, email: user.email, studentId: form.studentId || undefined },
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  const next = `/join?code=${encodeURIComponent(code)}`;

  return (
    <div className="container-x flex justify-center py-12">
      <div className="panel w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Join a team</h1>
        <p className="mt-1 text-sm text-zinc-400">Enter the 6-character invite code from your team leader. Joining is free.</p>

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
        >
          <label htmlFor="code" className="sr-only">Invite code</label>
          <input id="code" className="input font-mono uppercase tracking-widest" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} placeholder="ABC123" />
          <button className="btn-ghost" disabled={busy}>Check</button>
        </form>

        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        {lookup && lookup.state !== "VALID" && <p className="mt-4 text-sm text-rose-300">{STATE_MSG[lookup.state]}</p>}

        {lookup?.state === "VALID" && lookup.team && (
          <div className="mt-6">
            <div className="card p-4 text-sm">
              <p className="font-semibold text-white">{lookup.team.name}</p>
              <p className="text-zinc-400">
                Led by {lookup.team.leader} · {lookup.team.memberCount}/{lookup.team.paidCapacity} members
              </p>
            </div>

            {!user ? (
              <div className="mt-5 grid gap-2">
                <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn-primary">Log in to join</Link>
                <Link href={`/signup?next=${encodeURIComponent(next)}`} className="btn-ghost">Create an account</Link>
              </div>
            ) : (
              <form onSubmit={join} className="mt-5 space-y-4">
                {(
                  [
                    ["fullName", "Full name"],
                    ["phone", "Mobile number"],
                    ["college", "College"],
                    ["studentId", "Roll number / student ID"],
                  ] as const
                ).map(([k, label]) => (
                  <div key={k}>
                    <label className="label" htmlFor={k}>{label}</label>
                    <input id={k} className="input" value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} required={k !== "studentId"} />
                  </div>
                ))}
                <button className="btn-primary w-full py-3" disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Join team
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
