"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Calendar, ArrowRight, Radio, Sparkles } from "lucide-react";
import { PublicEvent } from "@/lib/events";
import { FEST, CATEGORIES } from "@/config/fest";
import { fmtTime, istDayKey } from "@/lib/format";

interface ScheduleProps {
  events: PublicEvent[];
}

export function ScheduleSection({ events }: ScheduleProps) {
  const [activeDay, setActiveDay] = useState<string>("2026-10-17");
  const [filterCat, setFilterCat] = useState<string>("ALL");

  // Filter events for the day
  const dayEvents = events
    .filter((e) => {
      const matchDay = istDayKey(e.startsAt) === activeDay;
      const matchCat = filterCat === "ALL" || e.category === filterCat;
      return matchDay && matchCat;
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  // Ceremony items for the day
  const ceremonies = FEST.ceremonies.filter((c) => c.day === activeDay);

  // Group events by time slots: Morning (<12:00), Afternoon (12:00-17:00), Evening (>17:00)
  const slots = [
    {
      slotName: "MORNING TRANSMISSION",
      timeRange: "09:00 AM – 12:00 PM",
      color: "border-brand-cyan text-brand-cyan",
      items: dayEvents.filter((e) => {
        const hour = new Date(e.startsAt).getHours();
        return hour < 12;
      }),
    },
    {
      slotName: "AFTERNOON PROTOCOL",
      timeRange: "12:00 PM – 05:00 PM",
      color: "border-brand-fuchsia text-brand-fuchsia",
      items: dayEvents.filter((e) => {
        const hour = new Date(e.startsAt).getHours();
        return hour >= 12 && hour < 17;
      }),
    },
    {
      slotName: "EVENING & OVERNIGHT",
      timeRange: "05:00 PM ONWARDS",
      color: "border-brand-violet text-brand-violet",
      items: dayEvents.filter((e) => {
        const hour = new Date(e.startsAt).getHours();
        return hour >= 17;
      }),
    },
  ];

  return (
    <section id="schedule" className="section container-x">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="eyebrow mb-2 justify-center text-[#CFB97E]">
          <Radio className="w-3.5 h-3.5 text-[#B89D47] animate-pulse" />
          FESTIVAL_TIMELINE // OPERATIONAL SCHEDULE
        </div>
        <h2 className="section-title">
          Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47]">Schedule</span>
        </h2>
        <p className="section-sub mx-auto">
          Synchronize your itinerary. Two days of non-stop innovation, hackathons, and celebrations across MVSR campus venues.
        </p>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {FEST.days.map((day) => (
          <button
            key={day.key}
            onClick={() => setActiveDay(day.key)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-cyber text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 ${
              activeDay === day.key
                ? "bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black shadow-[0_0_20px_rgba(184,157,71,0.4)] scale-105"
                : "bg-[#0A0F16] border border-white/10 text-zinc-400 hover:text-white hover:border-[#CFB97E]/40"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{day.long}</span>
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
        <button
          onClick={() => setFilterCat("ALL")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-cyber font-bold uppercase ${
            filterCat === "ALL" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          ALL
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilterCat(c.key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-cyber font-bold uppercase ${
              filterCat === c.key ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Schedule Slots */}
      <div className="space-y-10 max-w-4xl mx-auto">
        {/* Ceremonies banner if applicable */}
        {ceremonies.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-gradient-to-r from-[#053229]/60 via-[#355E58]/30 to-transparent border border-[#355E58]/60 flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(5,50,41,0.2)]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#053229] border border-[#355E58] text-[#B89D47] font-cyber font-extrabold text-sm sm:text-base">
                {c.time}
              </div>
              <div>
                <span className="text-[10px] font-cyber font-bold uppercase tracking-wider text-[#CFB97E] block">
                  OFFICIAL FEST CEREMONY
                </span>
                <h4 className="font-display text-base sm:text-xl font-black text-white">
                  {c.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#CFB97E]" /> {c.venue}
                </div>
              </div>
            </div>
          </div>
        ))}

        {slots.map((slot) => {
          if (slot.items.length === 0) return null;
          return (
            <div key={slot.slotName} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <Clock className="w-4 h-4 text-[#B89D47]" />
                <h3 className="font-cyber text-sm sm:text-base font-black text-white tracking-wider">
                  {slot.slotName}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  [{slot.timeRange}]
                </span>
              </div>

              <div className="grid gap-3">
                {slot.items.map((event) => (
                  <div
                    key={event.id}
                    className="cyber-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#CFB97E]/40 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-cyber font-bold uppercase bg-[#053229] text-[#BCDDDC] border border-[#355E58]">
                          {event.category}
                        </span>
                        <span className="text-xs font-cyber font-bold text-zinc-300" suppressHydrationWarning>
                          {fmtTime(event.startsAt)}
                        </span>
                      </div>
                      <h4 className="font-display text-lg font-bold text-white">
                        {event.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          {event.venue}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/events/${event.slug}`}
                        className="text-[11px] font-cyber font-bold px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition uppercase"
                      >
                        DETAILS
                      </Link>
                      <Link
                        href={`/register/${event.slug}`}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black text-[11px] font-cyber font-black hover:brightness-110 transition shadow-[0_0_15px_rgba(184,157,71,0.3)]"
                      >
                        REGISTER
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
