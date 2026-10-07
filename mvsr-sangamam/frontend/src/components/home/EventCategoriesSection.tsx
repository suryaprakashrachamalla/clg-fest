"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import TechnicalEventPanel from "./TechnicalEventPanel";
import { soundFx } from "@/utils/audio";
import { Mic, Terminal, Music2, Sparkles, Layers } from "lucide-react";
import { ALL_EVENTS_DATA, EventItemData } from "@/config/flagship-events";
import { EASE, SectionHeading, Stagger, StaggerItem, TiltCard, itemVariants } from "@/components/motion/primitives";

export { ALL_EVENTS_DATA };
export type { EventItemData };

interface EventCategoriesSectionProps {
  initialCategory?: string;
  onViewDetails?: (event: EventItemData) => void;
  onRegister: (event: EventItemData) => void;
}

type TabId = "ALL" | "TECHNICAL" | "SEMITECHNICAL" | "CULTURAL";

const TABS: { id: TabId; label: string; sub: string; icon: typeof Layers; accent: string }[] = [
  { id: "ALL", label: "ALL TRACKS", sub: "3 FLAGSHIP EVENTS", icon: Layers, accent: "#CFB97E" },
  { id: "TECHNICAL", label: "TECHNICAL", sub: "NATIONAL HACKATHON", icon: Terminal, accent: "#D4AF37" },
  { id: "SEMITECHNICAL", label: "SEMITECHNICAL", sub: "MUSIC MOB", icon: Music2, accent: "#BCDDDC" },
  { id: "CULTURAL", label: "CULTURAL", sub: "COMEDY NIGHT", icon: Mic, accent: "#FE9179" },
];

export default function EventCategoriesSection({ initialCategory, onViewDetails, onRegister }: EventCategoriesSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>((initialCategory as TabId) || "ALL");

  const filteredEvents =
    activeTab === "ALL" ? ALL_EVENTS_DATA : ALL_EVENTS_DATA.filter((e) => e.category === activeTab);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: EASE }}
        className="pointer-events-none absolute left-1/2 top-1/4 h-[min(700px,90vw)] w-[min(700px,90vw)] rounded-full bg-[#B89D47]/[0.06] blur-[160px]"
        style={{ x: "-50%" }}
      />

      <SectionHeading
        eyebrow="Official event registry // 2026 edition"
        icon={<Sparkles className="h-3.5 w-3.5 text-[#B89D47]" />}
        title="Choose your"
        accent="Domain"
        sub="From the 24-hour national hackathon to the high-energy synchronized Music Mob and premier live Comedy Night."
      />

      <Stagger className="mb-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" stagger={0.08}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <StaggerItem key={tab.id}>
              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  soundFx.playClickTone();
                  setActiveTab(tab.id);
                }}
                className={`relative flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-colors duration-300 sm:gap-4 sm:p-5 ${
                  isActive ? "border-transparent" : "border-white/10 bg-[#0A0F16]/80 text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
                style={isActive ? { color: tab.accent } : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="event-tab-active"
                    className="absolute inset-0 rounded-2xl border"
                    style={{
                      borderColor: tab.accent,
                      background: `linear-gradient(135deg, ${tab.accent}22, #053229aa 60%)`,
                      boxShadow: `0 0 30px ${tab.accent}33, inset 0 1px 0 ${tab.accent}44`,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <div
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border sm:h-10 sm:w-10 ${
                    isActive ? "border-current bg-white/10" : "border-white/10 bg-white/5 text-zinc-400"
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="relative">
                  <div className="font-cyber text-sm font-bold text-white sm:text-base">{tab.label}</div>
                  <div className="mt-0.5 font-mono text-[10px] tracking-wider opacity-80 sm:text-[11px]">{tab.sub}</div>
                </div>
              </motion.button>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Stagger className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.15}>
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              layout
              variants={itemVariants}
              exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)", transition: { duration: 0.35 } }}
              transition={{ layout: { type: "spring", stiffness: 260, damping: 30 } }}
              className="h-full"
            >
              <TiltCard className="h-full">
                <TechnicalEventPanel event={event} onViewDetails={onViewDetails} onRegister={onRegister} />
              </TiltCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </Stagger>
    </section>
  );
}
