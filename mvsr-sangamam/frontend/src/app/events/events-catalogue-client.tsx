"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  Trophy,
  Users,
  Calendar,
  MapPin,
  ArrowUpDown,
  RotateCcw,
  Terminal,
  Music2,
  Gamepad2,
  Compass,
  GraduationCap,
} from "lucide-react";
import { PublicEvent } from "@/lib/events";
import { EventCard } from "@/components/events/event-card";
import { EventModal } from "@/components/events/event-modal";
import { CATEGORIES } from "@/config/fest";

interface EventsCatalogueClientProps {
  initialEvents: PublicEvent[];
}

export default function EventsCatalogueClient({ initialEvents }: EventsCatalogueClientProps) {
  const [events] = useState<PublicEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [participationFilter, setParticipationFilter] = useState<"ALL" | "INDIVIDUAL" | "TEAM">("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "DATE" | "FEE_ASC" | "FEE_DESC" | "NAME">("DEFAULT");

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalPrizeEstimate = events.reduce((sum, e) => {
      const topPrize = e.prizes?.[0]?.amount || 0;
      return sum + topPrize;
    }, 0);

    const openCount = events.filter(
      (e) => e.registrationOpen && (e.capacity === null || (e.remaining !== null && e.remaining > 0))
    ).length;

    return {
      total: events.length,
      openCount,
      prizePool: totalPrizeEstimate > 0 ? `₹${(totalPrizeEstimate).toLocaleString()}+` : "₹1,50,000+",
    };
  }, [events]);

  // Filtered & Sorted events list
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        // Search text match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = e.name.toLowerCase().includes(q);
          const matchTagline = (e.tagline || "").toLowerCase().includes(q);
          const matchDesc = (e.description || "").toLowerCase().includes(q);
          const matchVenue = (e.venue || "").toLowerCase().includes(q);
          const matchCat = e.category.toLowerCase().includes(q);
          if (!matchName && !matchTagline && !matchDesc && !matchVenue && !matchCat) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== "ALL") {
          if (categoryFilter === "HACKATHON" && e.slug !== "hackathon" && e.category !== "HACKATHON") {
            return false;
          }
          if (categoryFilter !== "HACKATHON" && e.category !== categoryFilter) {
            return false;
          }
        }

        // Participation type
        if (participationFilter !== "ALL") {
          if (e.participationType !== participationFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "DATE") {
          return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
        }
        if (sortBy === "FEE_ASC") {
          return a.fee - b.fee;
        }
        if (sortBy === "FEE_DESC") {
          return b.fee - a.fee;
        }
        if (sortBy === "NAME") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [events, searchQuery, categoryFilter, participationFilter, sortBy]);

  const categoryTabs = [
    { id: "ALL", label: "All Events", icon: Layers },
    { id: "HACKATHON", label: "Hackathon", icon: Terminal },
    { id: "TECHNICAL", label: "Technical", icon: Sparkles },
    { id: "CULTURAL", label: "Cultural", icon: Music2 },
    { id: "GAMING", label: "Gaming", icon: Gamepad2 },
    { id: "WORKSHOP", label: "Workshops", icon: GraduationCap },
  ];

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setParticipationFilter("ALL");
    setSortBy("DEFAULT");
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#08090E] text-white">
      {/* Background ambient luxury glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#D4AF37]/10 via-[#053229]/15 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="container-x relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Header */}
        <div className="mb-6 flex items-center gap-2 text-xs font-mono text-[#D4AF37]/80">
          <Link href="/" className="hover:text-white transition">
            HOME
          </Link>
          <span>/</span>
          <span className="text-white font-bold">FESTIVAL EVENTS REGISTRY</span>
        </div>

        {/* Hero Banner Section */}
        <div className="relative rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#0E121B]/90 to-[#070A10]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#053229]/40 text-[#D4AF37] font-mono text-xs uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>OFFICIAL SANGAMAM 2026 CATALOGUE</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
                Events &amp; <span className="text-[#D4AF37] italic font-black">Competitions</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 font-sans leading-relaxed">
                Discover flagship hackathons, technical paper sprint arenas, live musical flash mobs, and stand-up showcases. Register solo or assemble your collegiate squad.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 sm:min-w-[340px]">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">{metrics.total}</div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1 uppercase">Total Tracks</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#D4AF37] font-mono">{metrics.prizePool}</div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1 uppercase">Prize Pool</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{metrics.openCount}</div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1 uppercase">Open Slots</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="space-y-4 mb-8">
          {/* Top Row: Search Input + Sorting */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event name, rules, venue, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0E121B] border border-white/10 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] transition font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {/* Participation Mode */}
              <select
                value={participationFilter}
                onChange={(e) => setParticipationFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-[#0E121B] border border-white/10 text-zinc-300 text-xs font-mono focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="ALL">All Formats</option>
                <option value="INDIVIDUAL">Solo Only</option>
                <option value="TEAM">Team Only</option>
              </select>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0E121B] border border-white/10">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-zinc-300 text-xs font-mono focus:outline-none cursor-pointer"
                >
                  <option value="DEFAULT">Recommended</option>
                  <option value="DATE">Date: Earliest</option>
                  <option value="FEE_ASC">Fee: Low to High</option>
                  <option value="FEE_DESC">Fee: High to Low</option>
                  <option value="NAME">Name: A–Z</option>
                </select>
              </div>

              {(searchQuery || categoryFilter !== "ALL" || participationFilter !== "ALL" || sortBy !== "DEFAULT") && (
                <button
                  onClick={resetFilters}
                  className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = categoryFilter === tab.id;
              const count = events.filter((e) => {
                if (tab.id === "ALL") return true;
                if (tab.id === "HACKATHON") return e.slug === "hackathon" || e.category === "HACKATHON";
                return e.category === tab.id;
              }).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#B89D47] via-[#D4AF37] to-[#B89D47] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                      : "bg-[#0E121B] border border-white/10 text-zinc-400 hover:text-white hover:border-[#D4AF37]/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                      isActive ? "bg-black/20 text-black font-extrabold" : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onOpenModal={(e) => setSelectedEvent(e)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl border border-white/10 bg-[#0E121B]/60 p-8">
            <Compass className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold font-display text-white">No matching events found</h3>
            <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
              We couldn&apos;t find any events matching your current search or category filters. Try adjusting your query or resetting filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B89D47] via-[#D4AF37] to-[#B89D47] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Modal Details Dialog */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
