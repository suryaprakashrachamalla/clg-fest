"use client";

import Link from "next/link";
import { Calendar, MapPin, Users, User, ArrowRight, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { PublicEvent } from "@/lib/events";
import { accentOf, feeLabel, fmtDate, fmtTime, teamSizeLabel } from "@/lib/format";

interface EventCardProps {
  event: PublicEvent;
  onOpenModal?: (event: PublicEvent) => void;
}

export function EventCard({ event, onOpenModal }: EventCardProps) {
  const accent = accentOf(event.accent);
  const isHackathon = event.slug === "hackathon" || event.category === "HACKATHON";
  const isTeam = event.participationType === "TEAM";

  // Capacity calculations
  const hasCapacity = event.capacity !== null && event.capacity > 0;
  const isFull = hasCapacity && (event.remaining === 0 || event.remaining === null);
  const isAlmostFull = hasCapacity && event.remaining !== null && event.remaining <= 10 && event.remaining > 0;

  return (
    <div className="cyber-card group flex flex-col justify-between p-6 sm:p-7 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-neon-cyan/20">
      {/* Background ambient corner glow */}
      <div
        className={`absolute -top-16 -right-16 w-36 h-36 rounded-full ${accent.glow} blur-3xl opacity-20 group-hover:opacity-70 transition duration-500 pointer-events-none`}
      />

      <div>
        {/* Top telemetry strip: Category + Team mode */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="font-cyber inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-brand-cyan group-hover:border-brand-cyan/40 transition">
            {isHackathon && <Sparkles className="w-3 h-3 text-brand-cyan animate-pulse" />}
            {event.category}
          </span>

          <span className="font-cyber inline-flex items-center gap-1.5 text-[10px] font-semibold text-zinc-300 bg-ink-950/80 px-2.5 py-1 rounded-lg border border-white/10">
            {isTeam ? <Users className="w-3 h-3 text-brand-cyan" /> : <User className="w-3 h-3 text-brand-amber" />}
            {teamSizeLabel(event)}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="font-display text-xl sm:text-2xl font-black text-white group-hover:text-brand-cyan transition duration-200">
          {event.name}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-zinc-300/80 line-clamp-2 leading-relaxed">
          {event.tagline || event.description}
        </p>

        {/* Dynamic Capacity Tracker */}
        {hasCapacity && (
          <div className="mt-4 p-3 rounded-xl bg-ink-950/80 border border-white/10 text-xs font-cyber">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5 text-[11px]">
              <span className="tracking-wider">{isTeam ? "SLOTS OCCUPIED" : "SEATS TAKEN"}</span>
              <span className="font-bold text-white">
                {event.confirmed} / {event.capacity} {isTeam ? "TEAMS" : "SLOTS"}
              </span>
            </div>

            {/* Glowing progress line */}
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull
                    ? "bg-rose-500"
                    : isAlmostFull
                    ? "bg-amber-400"
                    : "bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-fuchsia"
                }`}
                style={{ width: `${Math.min(100, ((event.confirmed || 0) / event.capacity!) * 100)}%` }}
              />
            </div>

            {isFull ? (
              <p className="mt-2 text-[10px] font-bold text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                <ShieldAlert className="w-3 h-3" /> [ CAPACITY MAXIMUM REACHED ]
              </p>
            ) : isAlmostFull ? (
              <p className="mt-2 text-[10px] font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wider">
                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                ⚡ ONLY {event.remaining} {isTeam ? "TEAM SLOTS" : "SLOTS"} LEFT!
              </p>
            ) : (
              <p className="mt-2 text-[10px] text-zinc-400 tracking-wider">
                {event.remaining} {isTeam ? "TEAM SLOTS" : "SLOTS"} AVAILABLE
              </p>
            )}
          </div>
        )}

        {/* Date, Time, Venue */}
        <div className="mt-4 space-y-1.5 text-xs text-zinc-400 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            <span suppressHydrationWarning>{fmtDate(event.startsAt)}, {fmtTime(event.startsAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-fuchsia shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Footer: Fee & Cyber Action Buttons */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <div>
          <span className="block text-[9px] font-cyber uppercase tracking-widest text-zinc-500 font-bold">
            ENTRY FEE
          </span>
          <span className="font-cyber text-base sm:text-lg font-black text-white text-glow-cyan">
            {feeLabel(event)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenModal ? (
            <button
              onClick={() => onOpenModal(event)}
              className="px-3 py-2 text-[11px] font-cyber font-bold rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition uppercase"
            >
              DETAILS
            </button>
          ) : (
            <Link
              href={`/events/${event.slug}`}
              className="px-3 py-2 text-[11px] font-cyber font-bold rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition uppercase"
            >
              DETAILS
            </Link>
          )}

          {isFull ? (
            <span className="px-3.5 py-2 text-[11px] font-cyber font-bold rounded-lg bg-zinc-800 text-zinc-500 cursor-not-allowed uppercase">
              CLOSED
            </span>
          ) : (
            <Link
              href={`/register/${event.slug}`}
              className="btn-cyan text-[11px] px-3.5 py-2 rounded-lg font-cyber font-black flex items-center gap-1.5"
            >
              REGISTER
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
