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
  const isHackathon = event.slug === "hackathon" || event.category === "HACKATHON";
  const isTeam = event.participationType === "TEAM";

  // Capacity calculations
  const hasCapacity = event.capacity !== null && event.capacity > 0;
  const isFull = hasCapacity && (event.remaining === 0 || event.remaining === null);
  const isAlmostFull = hasCapacity && event.remaining !== null && event.remaining <= 10 && event.remaining > 0;

  return (
    <div className="cyber-card group flex flex-col justify-between p-6 sm:p-7 transition-all duration-300">
      <div>
        {/* Top telemetry strip: Category + Team mode */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-white/[0.04] border border-white/[0.08] text-[#D4AF37] group-hover:border-[#D4AF37]/30 transition">
            {isHackathon && <Sparkles className="w-3 h-3 text-[#D4AF37]" />}
            {event.category}
          </span>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 bg-white/[0.02] px-2.5 py-1 rounded-lg border border-white/[0.06]">
            {isTeam ? <Users className="w-3 h-3 text-[#D4AF37]" /> : <User className="w-3 h-3 text-amber-400" />}
            {teamSizeLabel(event)}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-[#F4E3BA] transition duration-200">
          {event.name}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
          {event.tagline || event.description}
        </p>

        {/* Dynamic Capacity Tracker */}
        {hasCapacity && (
          <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/[0.06] text-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5 text-[11px]">
              <span className="font-medium text-zinc-400">{isTeam ? "Team Slots Filled" : "Seats Filled"}</span>
              <span className="font-bold text-white">
                {event.confirmed} / {event.capacity} {isTeam ? "Teams" : "Seats"}
              </span>
            </div>

            {/* Progress line */}
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull
                    ? "bg-rose-500"
                    : isAlmostFull
                    ? "bg-amber-400"
                    : "bg-gradient-to-r from-[#D4AF37] to-[#F4E3BA]"
                }`}
                style={{ width: `${Math.min(100, ((event.confirmed || 0) / event.capacity!) * 100)}%` }}
              />
            </div>

            {isFull ? (
              <p className="mt-2 text-[10px] font-medium text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Registration Closed (Full)
              </p>
            ) : isAlmostFull ? (
              <p className="mt-2 text-[10px] font-medium text-amber-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                Only {event.remaining} {isTeam ? "teams" : "seats"} left
              </p>
            ) : (
              <p className="mt-2 text-[10px] text-zinc-500">
                {event.remaining} {isTeam ? "team slots" : "seats"} available
              </p>
            )}
          </div>
        )}

        {/* Date, Time, Venue */}
        <div className="mt-4 space-y-1.5 text-xs text-zinc-400 border-t border-white/[0.06] pt-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span suppressHydrationWarning>{fmtDate(event.startsAt)}, {fmtTime(event.startsAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Footer: Fee & Action Buttons */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] text-zinc-500 font-medium">
            Entry Fee
          </span>
          <span className="text-base sm:text-lg font-bold text-white">
            {feeLabel(event)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenModal ? (
            <button
              onClick={() => onOpenModal(event)}
              className="px-3 py-2 text-xs font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              Details
            </button>
          ) : (
            <Link
              href={`/events/${event.slug}`}
              className="px-3 py-2 text-xs font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              Details
            </Link>
          )}

          {isFull ? (
            <span className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-500 cursor-not-allowed">
              Closed
            </span>
          ) : (
            <Link
              href={`/register/${event.slug}`}
              className="btn-primary text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5"
            >
              Register
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
