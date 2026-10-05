"use client";

import { useState } from "react";
import TechnicalEventPanel from "./TechnicalEventPanel";
import { soundFx } from "@/utils/audio";
import { Mic, Terminal, Music2, Sparkles, Layers } from "lucide-react";
import { ALL_EVENTS_DATA, EventItemData } from "@/config/flagship-events";

export { ALL_EVENTS_DATA };
export type { EventItemData };

interface EventCategoriesSectionProps {
  initialCategory?: string;
  onViewDetails?: (event: EventItemData) => void;
  onRegister: (event: EventItemData) => void;
}

export default function EventCategoriesSection({
  initialCategory,
  onViewDetails,
  onRegister,
}: EventCategoriesSectionProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "TECHNICAL" | "SEMITECHNICAL" | "CULTURAL">(
    (initialCategory as any) || "ALL"
  );

  const filteredEvents =
    activeTab === "ALL"
      ? ALL_EVENTS_DATA
      : ALL_EVENTS_DATA.filter((e) => e.category === activeTab);

  const tabs = [
    {
      id: "ALL" as const,
      label: "ALL TRACKS",
      sub: "3 FLAGSHIP EVENTS",
      icon: Layers,
      color: "border-[#CFB97E] text-[#CFB97E] bg-[#053229]/60 shadow-[0_0_25px_rgba(207,185,126,0.2)]",
    },
    {
      id: "TECHNICAL" as const,
      label: "TECHNICAL",
      sub: "NATIONAL HACKATHON",
      icon: Terminal,
      color: "border-[#B89D47] text-[#B89D47] bg-[#053229]/60 shadow-[0_0_25px_rgba(184,157,71,0.2)]",
    },
    {
      id: "SEMITECHNICAL" as const,
      label: "SEMITECHNICAL",
      sub: "MUSIC MOB",
      icon: Music2,
      color: "border-[#CFB97E] text-[#CFB97E] bg-[#355E58]/35 shadow-[0_0_25px_rgba(207,185,126,0.2)]",
    },
    {
      id: "CULTURAL" as const,
      label: "CULTURAL",
      sub: "COMEDY NIGHT",
      icon: Mic,
      color: "border-[#FE9179] text-[#FE9179] bg-[#FE9179]/15 shadow-[0_0_25px_rgba(254,145,121,0.2)]",
    },
  ];

  return (
    <section id="events" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Accent Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#B89D47]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#CFB97E]/30 bg-[#053229]/50 text-[#CFB97E] font-mono text-xs tracking-[0.25em] uppercase mb-4 shadow-[0_0_20px_rgba(184,157,71,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-[#B89D47]" />
          <span>OFFICIAL EVENT REGISTRY // 2026 EDITION</span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-black font-cyber text-white tracking-tight">
          CHOOSE YOUR <span className="text-[#B89D47] italic">DOMAIN</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#FFEDD1]/80 font-sans leading-relaxed">
          From the 24-hour national hackathon to the high-energy synchronized Music Mob and premier live Comedy Night.
        </p>
      </div>

      {/* Category Tab Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClickTone();
                setActiveTab(tab.id);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 flex items-start gap-3 sm:gap-4 cursor-pointer ${
                isActive
                  ? `${tab.color} scale-[1.02]`
                  : "border-white/10 bg-[#0A0F16]/80 text-zinc-400 hover:border-[#CFB97E]/40 hover:text-white"
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isActive
                    ? "border-current bg-white/10"
                    : "border-white/10 bg-white/5 text-zinc-400"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-cyber font-bold text-sm sm:text-base text-white">
                  {tab.label}
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono tracking-wider opacity-80 mt-0.5">
                  {tab.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Events Grid: Exactly 3 Flagship Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredEvents.map((event) => (
          <TechnicalEventPanel
            key={event.id}
            event={event}
            onViewDetails={onViewDetails}
            onRegister={onRegister}
          />
        ))}
      </div>
    </section>
  );
}
