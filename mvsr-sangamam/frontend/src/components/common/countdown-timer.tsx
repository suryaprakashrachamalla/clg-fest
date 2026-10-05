"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string; // ISO string e.g. "2026-10-17T09:00:00+05:30"
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function CountdownTimer({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPast: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 py-4">
        {["DAYS", "HOURS", "MINS", "SECS"].map((label) => (
          <div key={label} className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-ink-950/90 border border-white/10 flex items-center justify-center text-xl sm:text-3xl font-cyber font-bold text-white shadow-lg">
              --
            </div>
            <span className="mt-2 text-[10px] font-cyber text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
      {units.map((unit, idx) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="relative group">
            {/* Tech bracket HUD corners */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-brand-cyan group-hover:border-brand-fuchsia transition duration-300 z-10" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-brand-cyan group-hover:border-brand-fuchsia transition duration-300 z-10" />
            
            {/* Ambient neon back glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-fuchsia rounded-2xl blur-md opacity-25 group-hover:opacity-60 transition duration-500" />
            
            {/* Main digit box */}
            <div className="relative w-16 h-16 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-2xl bg-ink-950/90 border border-white/15 backdrop-blur-2xl flex flex-col items-center justify-center shadow-2xl">
              <span className="font-cyber text-2xl sm:text-3xl md:text-4xl font-black text-white text-glow-cyan tracking-wider tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
          </div>
          <span className="mt-2.5 text-[9px] sm:text-[10px] font-cyber font-extrabold uppercase tracking-[0.25em] text-zinc-400 group-hover:text-brand-cyan transition">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
