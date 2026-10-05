"use client";

import { useState, useMemo } from "react";
import { Search, Sparkles, Cpu } from "lucide-react";
import { PublicEvent } from "@/lib/events";
import { CATEGORIES } from "@/config/fest";
import { EventCard } from "./event-card";
import { EventModal } from "./event-modal";

interface EventsSectionProps {
  events: PublicEvent[];
}

export function EventsSection({ events }: EventsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalEvent, setModalEvent] = useState<PublicEvent | null>(null);

  const categories = useMemo(() => {
    return [{ key: "ALL", label: "ALL EVENTS" }, ...CATEGORIES.map(c => ({ key: c.key, label: c.label.toUpperCase() }))];
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory =
        selectedCategory === "ALL" || e.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  return (
    <section id="events" className="section container-x">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="eyebrow mb-2">
            <Cpu className="w-3.5 h-3.5 text-brand-cyan" />
            PROTOCOL_CATALOG // ARENAS & COMPETITIONS
          </div>
          <h2 className="section-title">
            Festival <span className="text-gradient">Arenas</span>
          </h2>
          <p className="section-sub">
            From 24-hour overnight hacking to algorithm showdowns, sonic battle of bands, mechatronic robotics, and LAN esports.
          </p>
        </div>

        {/* Search input with cyber border */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cyan" />
          <input
            type="text"
            placeholder="Search protocols & events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 pr-4 py-3 text-xs font-cyber tracking-wider focus:border-brand-cyan focus:ring-brand-cyan/20"
          />
        </div>
      </div>

      {/* Cyber Category Filter Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[11px] font-cyber font-bold tracking-wider uppercase transition-all duration-300 ${
                isSelected
                  ? "bg-brand-cyan text-black shadow-neon-cyan scale-105"
                  : "bg-ink-900/90 border border-white/10 text-zinc-400 hover:text-white hover:border-brand-cyan/40"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Event Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onOpenModal={(e) => setModalEvent(e)} />
          ))}
        </div>
      ) : (
        <div className="cyber-card text-center py-20 p-8 space-y-4">
          <p className="text-sm font-cyber text-zinc-400">NO ARENAS MATCH YOUR QUERY</p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
            }}
            className="btn-cyan text-xs"
          >
            RESET PROTOCOLS
          </button>
        </div>
      )}

      {/* Event Details Quick Modal */}
      <EventModal event={modalEvent} onClose={() => setModalEvent(null)} />
    </section>
  );
}
