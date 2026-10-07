"use client";

import { VelocityMarquee } from "@/components/motion/primitives";
import { FEST } from "@/config/fest";

const EVENTS = [
  "Hackathon",
  "Music Mob",
  "Comedy Night",
  "Code Sprint",
  "Byte Quiz",
  "Project Expo",
  "Robo Race",
  "Battle of Bands",
  "Treasure Hunt",
  "GenAI Workshop",
];

const TAGLINE = ["Compute", "Create", "Compete", FEST.dateLabel, "MVSR Hyderabad"];

function Star() {
  return <span className="mx-6 inline-block h-2.5 w-2.5 rotate-45 bg-[#D4AF37] shadow-[0_0_14px_#D4AF37] sm:mx-10" />;
}

export default function FestMarquee() {
  return (
    <div aria-hidden className="relative select-none overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#08090E] to-transparent sm:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#08090E] to-transparent sm:w-48" />

      <div className="-rotate-[1.5deg] border-y border-[#D4AF37]/15 bg-[#0A0F16]/70 py-4 backdrop-blur-sm">
        <VelocityMarquee baseVelocity={-2.5}>
          {EVENTS.map((name, i) => (
            <span key={name} className="flex items-center">
              <span
                className={`font-display text-4xl font-extrabold uppercase tracking-tight sm:text-6xl ${
                  i % 2 ? "text-outline" : "text-white/90"
                }`}
              >
                {name}
              </span>
              <Star />
            </span>
          ))}
        </VelocityMarquee>
      </div>

      <div className="mt-3 rotate-[1deg] py-2">
        <VelocityMarquee baseVelocity={2}>
          {TAGLINE.map((t) => (
            <span key={t} className="flex items-center">
              <span className="font-mono text-sm font-semibold uppercase tracking-[0.35em] text-[#CFB97E]/70 sm:text-base">
                {t}
              </span>
              <span className="mx-6 text-[#D4AF37]/50 sm:mx-10">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </div>
  );
}
