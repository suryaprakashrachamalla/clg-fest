"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Calendar,
  MapPin,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";
import { fmtDateTime } from "@/lib/format";

interface Props {
  token: string;
  initialCard: any | null;
  isOrganizer: boolean;
}

export function VerifyClient({ token, initialCard, isOrganizer }: Props) {
  const [card, setCard] = useState(initialCard);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: token, action: "checkin" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Check-in failed");
      }
      setCard(data.card);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not check in");
    } finally {
      setLoading(false);
    }
  };

  if (!card) {
    return (
      <div className="rounded-3xl bg-ink-900 border border-rose-500/30 p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          ✕ INVALID QR CODE
        </h1>
        <p className="text-sm text-zinc-400">
          This verification pass does not exist or has been revoked.
        </p>
        <Link href="/" className="btn-ghost inline-flex text-xs px-5 py-2.5 rounded-xl">
          Return to Fest Portal
        </Link>
      </div>
    );
  }

  const isCheckedIn = Boolean(card.checkIn);

  return (
    <div className="rounded-3xl bg-ink-900 border border-white/15 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Status Header */}
      <div className="text-center space-y-2 pb-4 border-b border-white/10">
        {isCheckedIn ? (
          <div className="space-y-1">
            <div className="inline-flex p-3 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-amber-400">
              ⚠ ALREADY CHECKED IN
            </h1>
            <p className="text-xs text-zinc-400">
              Checked in at {fmtDateTime(card.checkIn.at)} by {card.checkIn.by}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-emerald-400">
              ✓ VALID REGISTRATION
            </h1>
            <p className="text-xs text-zinc-400">
              Registration code: <strong className="text-white font-mono">{card.code}</strong>
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Details Box */}
      <div className="space-y-4 text-xs">
        {/* Event */}
        <div className="p-4 rounded-2xl bg-ink-950/70 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-brand-cyan tracking-wider block">
            {card.event.category}
          </span>
          <h3 className="font-display text-lg font-bold text-white">
            {card.event.name}
          </h3>
          <div className="flex items-center gap-2 text-zinc-400 pt-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span>{card.event.venue}</span>
          </div>
        </div>

        {/* Team if Hackathon */}
        {card.team ? (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-zinc-400">Team Name</span>
              <span className="font-bold text-white font-display text-sm">{card.team.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-zinc-400">Team ID</span>
              <span className="font-bold text-brand-cyan font-mono">{card.team.code || "—"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-zinc-400">Members Joined</span>
              <span className="font-bold text-white">{card.team.memberCount} / {card.team.paidCapacity}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1.5">
                Team Member Roster
              </span>
              <div className="space-y-1">
                {card.team.members.map((m: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-zinc-300 py-0.5">
                    <span>{m.name} ({m.college})</span>
                    <span className="text-zinc-500">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Participant Name</span>
              <span className="font-bold text-white">{card.participant.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">College</span>
              <span className="text-zinc-300">{card.participant.college}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Phone</span>
              <span className="text-zinc-300">{card.participant.phone}</span>
            </div>
          </div>
        )}

        {/* Payment status */}
        <div className="p-3.5 rounded-2xl bg-ink-950/70 border border-white/5 flex items-center justify-between">
          <span className="text-zinc-400">Payment Status</span>
          <span className="font-bold text-emerald-400">
            {card.paymentStatus} ({formatINR(card.amount)})
          </span>
        </div>
      </div>

      {/* Check In Action for Organizers */}
      <div className="pt-2">
        {isOrganizer ? (
          isCheckedIn ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-bold">
              Checked In · Cannot check in twice
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-extrabold rounded-2xl shadow-xl shadow-brand-violet/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  CHECK IN PARTICIPANT
                </>
              )}
            </button>
          )
        ) : (
          <div className="text-center text-xs text-zinc-500">
            Presenter view. Only authorized fest organizers can check in participants.
          </div>
        )}
      </div>
    </div>
  );
}
