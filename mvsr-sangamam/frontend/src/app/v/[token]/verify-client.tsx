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
  Award,
} from "lucide-react";
import { formatINR } from "@/utils/pricing";
import { fmtDateTime } from "@/utils/format";
import { FEST } from "@/config/fest";

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
      <div className="rounded-3xl bg-[#0B0D14] border border-rose-500/30 p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Invalid Pass
        </h1>
        <p className="text-sm text-zinc-400">
          This verification pass does not exist or has been cancelled.
        </p>
        <Link href="/" className="btn-ghost inline-flex text-xs px-5 py-2.5 rounded-xl">
          Return to Fest Portal
        </Link>
      </div>
    );
  }

  const isCheckedIn = Boolean(card.checkIn);

  return (
    <div className="rounded-3xl bg-[#0B0D14] border border-[#D4AF37]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Status Header */}
      <div className="text-center space-y-2 pb-5 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
          {FEST.name} {FEST.edition} · Gate Verification
        </div>

        {isCheckedIn ? (
          <div className="space-y-1.5 pt-1">
            <div className="inline-flex p-3 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-amber-400">
              Already Admitted
            </h1>
            <p className="text-xs text-zinc-400">
              Admitted at {fmtDateTime(card.checkIn.at)} by {card.checkIn.by}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-emerald-400">
              Pass Verified
            </h1>
            <p className="text-xs text-zinc-400">
              Pass Reference: <strong className="text-[#D4AF37] font-mono">{card.code}</strong>
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Details Box */}
      <div className="space-y-4 text-xs">
        {/* Event */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">
            {card.event.category}
          </span>
          <h3 className="font-display text-lg font-bold text-white">
            {card.event.name}
          </h3>
          <div className="flex items-center gap-2 text-zinc-400 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{card.event.venue}</span>
          </div>
        </div>

        {/* Team if Hackathon */}
        {card.team ? (
          <div className="p-4 rounded-2xl bg-[#0F121C] border border-[#D4AF37]/20 space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-zinc-400">Team Name</span>
              <span className="font-bold text-white font-display text-sm">{card.team.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-zinc-400">Team ID</span>
              <span className="font-bold text-[#D4AF37] font-mono">{card.team.code || "—"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-zinc-400">Team Capacity</span>
              <span className="font-medium text-white">{card.team.memberCount} of {card.team.paidCapacity} joined</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2">
                Team Roster
              </span>
              <div className="space-y-1">
                {card.team.members.map((m: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-zinc-300 py-1 border-b border-white/[0.02] last:border-0">
                    <span>{m.name} ({m.college})</span>
                    <span className="text-zinc-400 font-medium">{m.role}</span>
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
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <span className="text-zinc-400">Fee Status</span>
          <span className="font-semibold text-emerald-400">
            {card.paymentStatus} ({formatINR(card.amount)})
          </span>
        </div>
      </div>

      {/* Check In Action for Organizers */}
      <div className="pt-2">
        {isOrganizer ? (
          isCheckedIn ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-bold">
              ✓ Venue Admission Already Logged
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="btn-primary w-full py-3.5 text-xs font-bold rounded-2xl shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Confirm Venue Admission
                </>
              )}
            </button>
          )
        ) : (
          <div className="text-center text-xs text-zinc-500">
            Official Attendee Pass. Gate volunteers will scan this to confirm entry.
          </div>
        )}
      </div>
    </div>
  );
}
