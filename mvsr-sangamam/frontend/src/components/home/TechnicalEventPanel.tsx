"use client";

import { useState } from "react";
import Link from "next/link";
import { soundFx } from "@/utils/audio";
import { ArrowUpRight, Cpu, Terminal, Music2, Sparkles } from "lucide-react";
import { EventItemData } from "@/config/flagship-events";

export type { EventItemData };

interface TechnicalEventPanelProps {
  event: EventItemData;
  onViewDetails?: (event: EventItemData) => void;
  onRegister: (event: EventItemData) => void;
}

export default function TechnicalEventPanel({
  event,
  onViewDetails,
  onRegister,
}: TechnicalEventPanelProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Split title into base and gold italic accent word (Infinium flagship card aesthetic)
  const titleWords = event.title.split(" ");
  const baseTitle = titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : event.title;
  const accentWord = titleWords.length > 1 ? titleWords[titleWords.length - 1] : "";

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
        soundFx.playHoverBlip();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full rounded-2xl border border-[#CFB97E]/25 bg-gradient-to-b from-[#0C1118]/95 via-[#080C12]/95 to-[#05080C]/95 backdrop-blur-2xl p-6 sm:p-7 transition-all duration-300 hover:border-[#B89D47] hover:shadow-[0_0_35px_rgba(184,157,71,0.2)] flex flex-col justify-between overflow-hidden"
    >
      {/* Top Gold Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B89D47] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Kicker: OFFICIAL TRACK (Matching Infinium header style) */}
        <div className="flex items-center justify-between mb-3 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase">
          <span className="text-[#CFB97E] font-bold">
            {event.sponsor || `OFFICIAL TRACK · ${event.category}`}
          </span>
        </div>

        {/* Sponsor / Track Monogram Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 px-3 rounded-lg bg-[#053229] border border-[#355E58] flex items-center gap-2 text-white font-cyber font-black text-xs tracking-wider">
            {event.category === "TECHNICAL" && <Terminal className="w-3.5 h-3.5 text-[#B89D47]" />}
            {event.category === "SEMITECHNICAL" && <Cpu className="w-3.5 h-3.5 text-[#CFB97E]" />}
            {event.category === "CULTURAL" && <Music2 className="w-3.5 h-3.5 text-[#FE9179]" />}
            <span>SANGAMAM TRACK</span>
          </div>
        </div>

        {/* Sub-domain / Eyebrow in Arctic (#BCDDDC) */}
        <p className="text-[11px] font-mono font-bold text-[#BCDDDC] tracking-wider uppercase mb-1">
          {event.domain || event.specs[0] || "INNOVATION & CODE"}
        </p>

        {/* Headline Title: Crisp White + Bold Italic Gold Accent */}
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase leading-tight font-cyber">
          <span>{baseTitle} </span>
          <span className="text-[#B89D47] italic font-black">{accentWord}</span>
        </h3>

        {/* Pitch Tagline */}
        <p className="mt-2 text-xs sm:text-sm font-semibold text-[#FFEDD1] leading-snug">
          {event.tagline}
        </p>

        {/* Description */}
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
          {event.description}
        </p>

        {/* Prize Pool Box (Directly matching Infinium flagship prize card in reference image) */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-[#053229]/80 via-[#07241E]/70 to-[#053229]/80 border border-[#355E58]/80 shadow-[inset_0_1px_0_rgba(207,185,126,0.2)]">
          <div className="flex flex-wrap items-baseline gap-2">
            <strong className="text-2xl sm:text-3xl font-black text-[#B89D47] font-mono tracking-tight drop-shadow-[0_0_12px_rgba(184,157,71,0.3)]">
              {event.prizePool}
            </strong>
            <span className="text-xs font-bold text-[#FFEDD1] uppercase tracking-wider">
              prize pool
            </span>
          </div>
          {event.perks && (
            <div className="mt-1 text-xs text-[#FE9179] font-mono font-semibold">
              {event.perks}
            </div>
          )}
          <div className="mt-1.5 text-[11px] text-[#BCDDDC]/85 font-mono">
            {event.entryFee} · Evaluated by industry jury
          </div>
        </div>

        {/* Event Meta Specifications */}
        <div className="space-y-1.5 text-xs font-mono text-zinc-400 mb-2">
          <p>
            {event.teamSizeLabel} · {event.date}; {event.time}
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed pt-1">
            <span className="text-[#B89D47] font-bold">Open to all students nationwide. </span>
            <span>{event.highlight || "Build a working prototype that demonstrates real innovation."}</span>
          </p>
        </div>
      </div>

      {/* Card Bottom Footer: Matches Infinium reference image */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08] font-mono text-xs">
        {/* Left: Registration Status & Action */}
        <button
          onClick={() => {
            soundFx.playClickTone();
            onRegister(event);
          }}
          className="flex items-center gap-2 group/reg cursor-pointer py-1 text-left focus:outline-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[11px] font-bold text-white tracking-wider uppercase group-hover/reg:text-[#CFB97E] transition">
            REGISTRATION OPEN
          </span>
        </button>

        {/* Right: Event Details Link to dedicated Webpage */}
        <Link
          href={`/events/${event.slug}`}
          onClick={() => soundFx.playClickTone()}
          className="flex items-center gap-1.5 text-xs text-[#FFEDD1] hover:text-[#B89D47] font-semibold transition group/link py-1"
        >
          <span className="underline underline-offset-4 decoration-[#CFB97E]/40 group-hover/link:decoration-[#B89D47]">
            Event details
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#B89D47] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
