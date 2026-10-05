"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Calendar,
  UserCheck,
} from "lucide-react";

interface Props {
  initialCode: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    college: string;
    studentId: string;
  } | null;
}

interface TeamData {
  id: string;
  name: string;
  code?: string | null;
  leader: string;
  memberCount: number;
  paidCapacity: number;
  members: { name: string; role: string; college: string }[];
  event: { id: string; name: string; slug: string; startsAt: string; venue: string };
  expiresAt: string;
}

export function JoinClient({ initialCode, currentUser }: Props) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [lookupState, setLookupState] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [college, setCollege] = useState(currentUser?.college || "MVSR Engineering College");
  const [studentId, setStudentId] = useState(currentUser?.studentId || "");
  const [joining, setJoining] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  const lookupCode = async (c: string) => {
    const clean = c.trim().toUpperCase();
    if (!clean || clean.length < 5) return;
    setLoading(true);
    setErrorMsg(null);
    setTeam(null);
    setLookupState(null);

    try {
      const res = await fetch(`/api/teams/lookup?code=${clean}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to lookup code");
      }

      setLookupState(data.state);
      if (data.state === "VALID") {
        setTeam(data.team);
      } else if (data.state === "FULL") {
        setErrorMsg("This team has already reached its maximum paid capacity.");
      } else if (data.state === "EXPIRED") {
        setErrorMsg("This team invitation code has expired.");
      } else {
        setErrorMsg("Invalid invitation code. Please verify with your team leader.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to lookup invitation code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      lookupCode(initialCode);
    }
  }, [initialCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push(`/login?next=/join?code=${code}`);
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!/^(\+91)?[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!college.trim()) {
      setErrorMsg("Please enter your college name.");
      return;
    }

    setJoining(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          participant: {
            fullName: fullName.trim(),
            email: currentUser.email,
            phone: phone.trim(),
            college: college.trim(),
            studentId: studentId.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join team");
      }

      setJoinedSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to join team.");
    } finally {
      setJoining(false);
    }
  };

  if (joinedSuccess) {
    return (
      <div className="min-h-screen pt-28 pb-20 container-x max-w-xl text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-ink-900 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            🎉 Welcome to the Team!
          </h1>

          <p className="text-sm text-zinc-300">
            You have successfully joined <strong className="text-white">{team?.name}</strong> for {team?.event.name}.
          </p>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-zinc-400">
            No payment required — your seat was pre-paid by your team leader. Your team details and venue pass are ready in your dashboard.
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              Go to My Registrations Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 container-x max-w-2xl">
      <div className="text-center mb-8 space-y-2">
        <div className="eyebrow mb-2">
          <Users className="w-3.5 h-3.5" />
          TEAM MEMBER INVITATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          Join a <span className="text-gradient">Team</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Enter the 6-character code shared by your team leader to claim your member seat.
        </p>
      </div>

      {/* Code Input Card */}
      <div className="rounded-3xl bg-ink-900/90 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl mb-8">
        <div className="space-y-4">
          <label className="label text-center block text-sm font-semibold">
            Enter Invitation Code
          </label>

          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="text"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. X7K9P2"
              className="input text-center text-xl font-mono uppercase tracking-[0.25em] font-extrabold"
            />
            <button
              onClick={() => lookupCode(code)}
              disabled={loading || code.trim().length < 5}
              className="btn-primary px-6 rounded-xl font-bold flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Verify
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Team Details & Join Form */}
      {team && lookupState === "VALID" && (
        <div className="rounded-3xl bg-ink-900/90 border border-brand-violet/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 animate-fade-in">
          {/* Team Summary */}
          <div className="p-5 rounded-2xl bg-ink-950/80 border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-cyan block">
                  {team.event.name}
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                  Team {team.name}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block font-medium">Team Leader</span>
                <span className="text-sm font-bold text-white">{team.leader}</span>
              </div>
            </div>

            {/* Dynamic Capacity Progress Indicator */}
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                <span>Team Capacity Progress</span>
                <span className="font-bold text-white">
                  {team.memberCount} / {team.paidCapacity} Members ({team.paidCapacity - team.memberCount} Slots Remaining)
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-violet via-brand-fuchsia to-brand-cyan rounded-full transition-all duration-500"
                  style={{ width: `${(team.memberCount / team.paidCapacity) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Members List */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Confirmed Members
              </span>
              <div className="grid gap-2">
                {team.members.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-white flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-brand-cyan" />
                      {m.name}
                    </span>
                    <span className="text-zinc-500">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Pre-paid seat: No additional fee is charged to join this team.
              </span>
            </div>
          </div>

          {/* Member Details Form */}
          {!currentUser ? (
            <div className="p-6 rounded-2xl bg-brand-violet/10 border border-brand-violet/20 text-center space-y-3">
              <p className="text-sm text-zinc-200">
                Please sign in or create an account to join this team.
              </p>
              <Link
                href={`/login?next=/join?code=${code}`}
                className="btn-primary inline-flex px-6 py-2.5 rounded-xl font-bold text-xs"
              >
                Sign In to Continue
              </Link>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Your Participant Details
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="input opacity-60 cursor-not-allowed bg-ink-950"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Mobile Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">College / Institution *</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="MVSR Engineering College"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Student ID / Roll Number</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="2451-22-733-002"
                  className="input"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={joining}
                  className="btn-primary px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-brand-violet/25"
                >
                  {joining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining Team...
                    </>
                  ) : (
                    <>
                      Join Team Now
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
