"use client";

import { useEffect, useState } from "react";
import { Users, AlertCircle, ShieldCheck } from "lucide-react";

interface CapacityBadgeProps {
  slug: string;
  initialCapacity: number | null;
  initialConfirmed: number;
  initialRemaining: number | null;
  isTeam: boolean;
  isHackathon: boolean;
}

export function DynamicCapacityBadge({
  slug,
  initialCapacity,
  initialConfirmed,
  initialRemaining,
  isTeam,
  isHackathon,
}: CapacityBadgeProps) {
  const [capacity, setCapacity] = useState(initialCapacity);
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [remaining, setRemaining] = useState(initialRemaining);

  useEffect(() => {
    let mounted = true;
    const fetchAvailability = async () => {
      try {
        const res = await fetch(`/api/events/${slug}/availability`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setCapacity(data.capacity);
          setConfirmed(data.confirmed);
          setRemaining(data.remaining);
        }
      } catch {
        // quiet fallback
      }
    };

    const interval = setInterval(fetchAvailability, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [slug]);

  if (capacity === null) return null;

  const isFull = remaining !== null && remaining <= 0;
  const isUrgent = remaining !== null && remaining <= 5 && remaining > 0;
  const unit = isTeam ? "Teams" : "Slots";
  const percentage = Math.min(100, Math.round((confirmed / capacity) * 100));

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-[#0A0F16]/90 border border-[#355E58]/40 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-[10px] font-mono font-bold text-[#CFB97E] uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-[#B89D47]" />
            {isHackathon ? "FLAGSHIP TRACK // CAPACITY LIMIT" : "LIVE ARENA TELEMETRY"}
          </div>
          <div className="font-cyber text-xl sm:text-2xl font-black text-white mt-1">
            {isHackathon ? (
              <span>MAXIMUM: 50 TEAMS</span>
            ) : (
              <span>CAPACITY: {capacity} {unit.toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right font-mono">
          <div className="text-sm sm:text-base font-bold text-white">
            {confirmed} / {capacity} {unit.toUpperCase()} OCCUPIED
          </div>
          <div className="text-xs font-semibold mt-0.5">
            {isFull ? (
              <span className="text-[#FE9179]">ALL SLOTS FILLED</span>
            ) : isUrgent ? (
              <span className="text-[#B89D47] flex items-center sm:justify-end gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#B89D47]" />
                ⚡ ONLY {remaining} {unit.toUpperCase()} SLOTS REMAINING!
              </span>
            ) : (
              <span className="text-[#BCDDDC]">
                {remaining} {unit.toUpperCase()} SLOTS AVAILABLE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isFull
              ? "bg-[#FE9179]"
              : isUrgent
              ? "bg-[#B89D47]"
              : "bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#BCDDDC]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#FFEDD1]/60 uppercase tracking-wider">
        <span>DATABASE STATUS: LIVE SYNCHRONIZED</span>
        <span className="font-bold text-[#CFB97E]">{percentage}% CAPACITY ALLOCATED</span>
      </div>
    </div>
  );
}
