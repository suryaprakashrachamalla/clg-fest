"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Clock, MapPin, Calendar, Radio, Sparkles } from "lucide-react";
import { PublicEvent } from "@/lib/events";
import { FEST, CATEGORIES } from "@/config/fest";
import { fmtTime, istDayKey } from "@/lib/format";
import { EASE, SectionHeading } from "@/components/motion/primitives";

interface ScheduleProps {
  events: PublicEvent[];
}

const slotOf = (iso: string) => {
  const h = new Date(iso).getHours();
  return h < 12 ? 0 : h < 17 ? 1 : 2;
};

const SLOTS = [
  { name: "Morning Transmission", range: "09:00 AM – 12:00 PM" },
  { name: "Afternoon Protocol", range: "12:00 PM – 05:00 PM" },
  { name: "Evening & Overnight", range: "05:00 PM onwards" },
];

export function ScheduleSection({ events }: ScheduleProps) {
  const [activeDay, setActiveDay] = useState<string>(FEST.days[0].key);
  const [filterCat, setFilterCat] = useState<string>("ALL");

  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 75%", "end 55%"] });
  const railScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const dayEvents = events
    .filter((e) => istDayKey(e.startsAt) === activeDay && (filterCat === "ALL" || e.category === filterCat))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const ceremonies = FEST.ceremonies.filter((c) => c.day === activeDay);
  const slots = SLOTS.map((s, i) => ({ ...s, items: dayEvents.filter((e) => slotOf(e.startsAt) === i) }));
  const empty = ceremonies.length === 0 && dayEvents.length === 0;

  return (
    <section className="section container-x">
      <SectionHeading
        eyebrow="Festival timeline // operational schedule"
        icon={<Radio className="h-3.5 w-3.5 animate-pulse text-[#B89D47]" />}
        title="Mission"
        accent="Schedule"
        sub="Synchronize your itinerary. Two days of non-stop innovation, hackathons, and celebrations across MVSR campus venues."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mx-auto mb-8 flex w-fit flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-[#0A0F16]/80 p-1.5 backdrop-blur-xl"
      >
        {FEST.days.map((day, i) => {
          const active = activeDay === day.key;
          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`relative flex items-center gap-2.5 rounded-xl px-5 py-3 font-cyber text-xs font-bold uppercase tracking-wider transition-colors duration-300 sm:px-6 sm:text-sm ${
                active ? "text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="schedule-day"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#B89D47] via-[#F4E3BA] to-[#B89D47] shadow-[0_0_24px_rgba(184,157,71,0.45)]"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <Calendar className="relative h-4 w-4" />
              <span className="relative">
                Day {i + 1} · {day.long}
              </span>
            </button>
          );
        })}
      </motion.div>

      <div className="scrollbar-none mb-10 flex items-center justify-center gap-1 overflow-x-auto pb-4">
        {[{ key: "ALL", label: "All" }, ...CATEGORIES].map((c) => {
          const active = filterCat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setFilterCat(c.key)}
              className={`relative rounded-lg px-3 py-1.5 font-cyber text-[10px] font-bold uppercase transition-colors ${
                active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="schedule-cat"
                  className="absolute inset-0 rounded-lg border border-white/10 bg-white/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{c.label}</span>
            </button>
          );
        })}
      </div>

      <div ref={railRef} className="relative mx-auto max-w-4xl pl-8 sm:pl-12">
        <div aria-hidden className="absolute bottom-0 left-2.5 top-0 w-px bg-white/[0.07] sm:left-4" />
        <motion.div
          aria-hidden
          style={{ scaleY: railScale }}
          className="absolute bottom-0 left-2.5 top-0 w-px origin-top bg-gradient-to-b from-[#D4AF37] via-[#CFB97E] to-[#FE9179] shadow-[0_0_10px_#D4AF37] sm:left-4"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeDay}-${filterCat}`}
            initial={{ opacity: 0, x: 30, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -30, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="space-y-10"
          >
            {ceremonies.map((c) => (
              <TimelineItem key={c.id}>
                <div className="flex items-center gap-4 rounded-2xl border border-[#355E58]/60 bg-gradient-to-r from-[#053229]/60 via-[#355E58]/30 to-transparent p-5 shadow-[0_0_20px_rgba(5,50,41,0.2)]">
                  <div className="rounded-xl border border-[#355E58] bg-[#053229] p-3 font-cyber text-sm font-extrabold text-[#B89D47] sm:text-base">
                    {c.time}
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 font-cyber text-[10px] font-bold uppercase tracking-wider text-[#CFB97E]">
                      <Sparkles className="h-3 w-3" /> Official fest ceremony
                    </span>
                    <h4 className="font-display text-base font-black text-white sm:text-xl">{c.title}</h4>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin className="h-3 w-3 text-[#CFB97E]" /> {c.venue}
                    </div>
                  </div>
                </div>
              </TimelineItem>
            ))}

            {slots.map((slot) =>
              slot.items.length === 0 ? null : (
                <div key={slot.name} className="space-y-4">
                  <TimelineItem>
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Clock className="h-4 w-4 text-[#B89D47]" />
                      <h3 className="font-cyber text-sm font-black uppercase tracking-wider text-white sm:text-base">
                        {slot.name}
                      </h3>
                      <span className="font-mono text-xs text-zinc-400">[{slot.range}]</span>
                    </div>
                  </TimelineItem>

                  {slot.items.map((event) => (
                    <TimelineItem key={event.id} dot>
                      <motion.div
                        whileHover={{ x: 6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="cyber-card flex flex-col justify-between gap-4 p-5 hover:border-[#CFB97E]/40 sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded border border-[#355E58] bg-[#053229] px-2 py-0.5 font-cyber text-[10px] font-bold uppercase text-[#BCDDDC]">
                              {event.category}
                            </span>
                            <span className="font-cyber text-xs font-bold text-zinc-300" suppressHydrationWarning>
                              {fmtTime(event.startsAt)}
                            </span>
                          </div>
                          <h4 className="font-display text-lg font-bold text-white">{event.name}</h4>
                          <div className="flex items-center gap-1 truncate text-xs text-zinc-400">
                            <MapPin className="h-3 w-3 text-zinc-500" />
                            {event.venue}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <Link
                            href={`/events/${event.slug}`}
                            className="rounded-xl px-3 py-2 font-cyber text-[11px] font-bold uppercase text-zinc-300 transition hover:bg-white/5 hover:text-white"
                          >
                            Details
                          </Link>
                          <Link
                            href={`/register/${event.slug}`}
                            className="rounded-xl bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] px-3.5 py-2 font-cyber text-[11px] font-black text-black shadow-[0_0_15px_rgba(184,157,71,0.3)] transition hover:brightness-110"
                          >
                            REGISTER
                          </Link>
                        </div>
                      </motion.div>
                    </TimelineItem>
                  ))}
                </div>
              ),
            )}

            {empty && (
              <TimelineItem>
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
                  Nothing in this category on {FEST.days.find((d) => d.key === activeDay)?.long}. Try another filter.
                </div>
              </TimelineItem>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function TimelineItem({ children, dot }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative"
    >
      {dot && (
        <span className="absolute -left-[28px] top-1/2 flex h-3 w-3 -translate-y-1/2 items-center justify-center sm:-left-[38px]">
          <span className="absolute h-3 w-3 animate-ping rounded-full bg-[#D4AF37]/40" />
          <span className="relative h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" />
        </span>
      )}
      {children}
    </motion.div>
  );
}
