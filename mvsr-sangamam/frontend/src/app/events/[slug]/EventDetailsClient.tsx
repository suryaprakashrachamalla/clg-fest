"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Share2,
  Terminal,
  Cpu,
  Music2,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import { PublicEvent } from "@/lib/events";
import { feeLabel, fmtDate, fmtTime, teamSizeLabel } from "@/lib/format";
import { DynamicCapacityBadge } from "@/components/events/dynamic-capacity-badge";
import RegistrationModal from "@/components/home/RegistrationModal";
import { EventItemData } from "@/config/flagship-events";
import { soundFx } from "@/utils/audio";

interface EventDetailsClientProps {
  event: PublicEvent;
  cardData: EventItemData;
}

export default function EventDetailsClient({ event, cardData }: EventDetailsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"register" | "rules">("register");
  const [copied, setCopied] = useState(false);

  // Split title for two-tone bold italic look
  const titleWords = event.name.split(" ");
  const baseTitle = titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : event.name;
  const accentWord = titleWords.length > 1 ? titleWords[titleWords.length - 1] : "";

  const isHackathon = event.slug === "hackathon" || event.category === "TECHNICAL";
  const isTeam = event.participationType === "TEAM";
  const isFull = event.capacity !== null && (event.remaining === 0 || event.remaining === null);

  const handleOpenRegister = () => {
    soundFx.playClickTone();
    setModalMode("register");
    setModalOpen(true);
  };

  const handleOpenRules = () => {
    soundFx.playClickTone();
    setModalMode("rules");
    setModalOpen(true);
  };

  const handleShare = () => {
    soundFx.playClickTone();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#05070D] text-white">
      {/* Ambient background glow matching luxury gold / spruce */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#B89D47]/10 via-[#053229]/20 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="container-x relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Breadcrumb & Back Link */}
        <div className="mb-6 flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#CFB97E]/80">
            <Link href="/" className="hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 text-[#B89D47]" />
              HOME
            </Link>
            <span>/</span>
            <Link href="/#events" className="hover:text-white transition">
              TRACKS
            </Link>
            <span>/</span>
            <span className="text-white font-bold">{event.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-[#FFEDD1] transition"
          >
            <Share2 className="w-3.5 h-3.5 text-[#B89D47]" />
            <span>{copied ? "LINK COPIED!" : "SHARE"}</span>
          </button>
        </div>

        {/* ── FLAGSHIP HERO BANNER ────────────────────────────────────────── */}
        <div className="rounded-3xl border border-[#CFB97E]/30 bg-gradient-to-b from-[#0C1118]/95 via-[#080C12]/95 to-[#05080C]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden mb-10">
          {/* Top gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B89D47] to-transparent opacity-80" />

          {/* Track Kicker Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#CFB97E]">
              <div className="h-6 px-2.5 rounded bg-[#053229] border border-[#355E58] flex items-center gap-1.5 text-white font-bold">
                {event.category === "TECHNICAL" && <Terminal className="w-3.5 h-3.5 text-[#B89D47]" />}
                {event.category === "SEMITECHNICAL" && <Cpu className="w-3.5 h-3.5 text-[#CFB97E]" />}
                {event.category === "CULTURAL" && <Music2 className="w-3.5 h-3.5 text-[#FE9179]" />}
                <span>{event.category} TRACK</span>
              </div>
              <span className="text-zinc-500">•</span>
              <span className="text-[#BCDDDC] font-bold">{cardData.domain || "FLAGSHIP SPRINT"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-white tracking-widest uppercase">
                REGISTRATION OPEN
              </span>
            </div>
          </div>

          {/* Headline Title: Bold White + Italic Gold */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-cyber font-black text-white tracking-tight leading-tight uppercase">
            <span>{baseTitle} </span>
            <span className="text-[#B89D47] italic drop-shadow-[0_0_25px_rgba(184,157,71,0.35)]">
              {accentWord}
            </span>
          </h1>

          {/* Tagline */}
          <p className="mt-3 text-base sm:text-xl text-[#FFEDD1] max-w-3xl leading-relaxed font-sans font-medium">
            {event.tagline || cardData.tagline}
          </p>

          {/* Dynamic Capacity Telemetry */}
          <div className="mt-7 pt-6 border-t border-white/10">
            <DynamicCapacityBadge
              slug={event.slug}
              initialCapacity={event.capacity}
              initialConfirmed={event.confirmed}
              initialRemaining={event.remaining}
              isTeam={isTeam}
              isHackathon={isHackathon}
            />
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-7 p-4 sm:p-5 rounded-2xl bg-[#053229]/30 border border-[#355E58]/50 text-xs font-mono">
            <div>
              <span className="text-[#CFB97E]/70 block mb-1 uppercase tracking-wider text-[10px]">
                DATE & DURATION
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#B89D47] shrink-0" />
                {cardData.date || fmtDate(event.startsAt)}
              </span>
            </div>

            <div>
              <span className="text-[#CFB97E]/70 block mb-1 uppercase tracking-wider text-[10px]">
                EVENT TIMINGS
              </span>
              <span className="text-sm font-bold text-white">
                {cardData.time || `${fmtTime(event.startsAt)} – ${fmtTime(event.endsAt)}`}
              </span>
            </div>

            <div>
              <span className="text-[#CFB97E]/70 block mb-1 uppercase tracking-wider text-[10px]">
                CAMPUS VENUE
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4 text-[#FE9179] shrink-0" />
                {event.venue || cardData.venue}
              </span>
            </div>

            <div>
              <span className="text-[#CFB97E]/70 block mb-1 uppercase tracking-wider text-[10px]">
                ENTRY FEE
              </span>
              <span className="text-sm font-bold text-[#B89D47]">
                {cardData.entryFee || feeLabel(event)}
              </span>
            </div>
          </div>

          {/* Registration CTA Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#B89D47]/10 border border-[#B89D47]/30">
                <Trophy className="w-6 h-6 text-[#B89D47]" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#CFB97E] block uppercase tracking-wider">
                  OFFICIAL PRIZE POOL
                </span>
                <span className="text-2xl font-black font-mono text-[#B89D47]">
                  {cardData.prizePool}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenRules}
                className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-[#FFEDD1] transition"
              >
                VIEW RULES & GUIDELINES
              </button>

              {isFull ? (
                <span className="px-6 py-3.5 rounded-xl font-mono font-bold text-xs bg-zinc-800 text-zinc-500 cursor-not-allowed">
                  REGISTRATIONS FULL
                </span>
              ) : (
                <Link
                  href={`/register/${event.slug}`}
                  onClick={() => soundFx.playClickTone()}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black font-cyber font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_25px_rgba(184,157,71,0.5)] transition flex items-center gap-2"
                >
                  <span>REGISTER NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── DETAILED EVENT CONTENT GRID ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main 2-Column Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Overview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#080C12]/90 border border-[#CFB97E]/20 backdrop-blur-xl">
              <h3 className="font-cyber font-black text-xl text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Sparkles className="w-5 h-5 text-[#B89D47]" />
                TRACK OVERVIEW & BRIEF
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                {event.description}
              </p>

              {cardData.highlight && (
                <div className="mt-5 p-4 rounded-2xl bg-[#053229]/40 border border-[#355E58]/60 text-xs font-mono text-[#FFEDD1]">
                  <span className="text-[#B89D47] font-bold">KEY HIGHLIGHT: </span>
                  {cardData.highlight}
                </div>
              )}
            </div>

            {/* 2. Rules & Regulations */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#080C12]/90 border border-[#CFB97E]/20 backdrop-blur-xl">
              <h3 className="font-cyber font-black text-xl text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-5 h-5 text-[#CFB97E]" />
                RULES & CODE OF CONDUCT
              </h3>
              <ul className="space-y-3.5 text-sm text-zinc-300 font-sans">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B89D47] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B89D47] shrink-0 mt-0.5" />
                  <span>Participants must strictly carry their college ID cards for on-campus verification.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B89D47] shrink-0 mt-0.5" />
                  <span>The decisions of the jury and faculty coordinators are final and binding.</span>
                </li>
              </ul>
            </div>

            {/* 3. Eligibility */}
            {event.eligibility && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#080C12]/90 border border-[#CFB97E]/20 backdrop-blur-xl">
                <h3 className="font-cyber font-black text-xl text-white mb-3 uppercase tracking-wide">
                  ELIGIBILITY CRITERIA
                </h3>
                <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                  {event.eligibility}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-lg bg-[#053229] border border-[#355E58] text-[#BCDDDC]">
                    All Colleges Eligible
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#053229] border border-[#355E58] text-[#BCDDDC]">
                    Physical Campus Presence
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#053229] border border-[#355E58] text-[#BCDDDC]">
                    Verified Student Credentials
                  </span>
                </div>
              </div>
            )}

            {/* 4. Event FAQs */}
            {event.faqs && event.faqs.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#080C12]/90 border border-[#CFB97E]/20 backdrop-blur-xl">
                <h3 className="font-cyber font-black text-xl text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <HelpCircle className="w-5 h-5 text-[#FE9179]" />
                  FREQUENTLY ASKED QUESTIONS
                </h3>
                <div className="space-y-4 font-sans">
                  {event.faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="font-bold text-sm text-white mb-1">
                        {faq.q}
                      </div>
                      <div className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* 1. Prizes Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#053229]/60 via-[#0C1118]/90 to-[#080C12]/95 border border-[#CFB97E]/30 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.5)]">
              <h3 className="font-cyber font-black text-lg text-[#B89D47] mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Trophy className="w-5 h-5 text-[#B89D47]" />
                PRIZES & AWARDS
              </h3>

              <div className="space-y-3 font-mono">
                {event.prizes && event.prizes.length > 0 ? (
                  event.prizes.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/60 border border-[#355E58]/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-300">{p.place}</div>
                        {p.label && <div className="text-[10px] text-[#CFB97E]/80">{p.label}</div>}
                      </div>
                      <span className="text-sm font-black text-[#B89D47]">
                        {p.amount ? `₹${p.amount.toLocaleString()}` : "Award"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-[#355E58]/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Total Pool</span>
                    <span className="text-sm font-black text-[#B89D47]">{cardData.prizePool}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Coordinators Card */}
            {event.coordinators && event.coordinators.length > 0 && (
              <div className="p-6 rounded-3xl bg-[#080C12]/90 border border-[#CFB97E]/20 backdrop-blur-xl">
                <h3 className="font-cyber font-black text-lg text-white mb-4 uppercase tracking-wide">
                  TRACK COORDINATORS
                </h3>
                <div className="space-y-3 font-sans">
                  {event.coordinators.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-1.5"
                    >
                      <div className="font-bold text-white text-sm">{c.name}</div>
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="text-[#CFB97E] hover:text-white transition flex items-center gap-2"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#B89D47]" /> {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="text-zinc-400 hover:text-white transition flex items-center gap-2 truncate"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#FE9179]" /> {c.email}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Pinned Instant Registration Card */}
            <div className="p-6 rounded-3xl bg-[#053229]/40 border border-[#355E58] text-center">
              <h4 className="font-cyber font-black text-white text-base mb-1.5 uppercase">
                READY TO COMPETE?
              </h4>
              <p className="text-xs text-[#FFEDD1]/75 mb-4 font-sans">
                Lock in your team before slots reach capacity. Instant digital pass issued upon registration.
              </p>
              {!isFull && (
                <Link
                  href={`/register/${event.slug}`}
                  onClick={() => soundFx.playClickTone()}
                  className="block w-full py-3.5 text-xs font-cyber font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black hover:brightness-110 shadow-[0_0_20px_rgba(184,157,71,0.4)] transition text-center"
                >
                  REGISTER NOW
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instant In-Page Registration & Rules Modal */}
      {modalOpen && (
        <RegistrationModal
          event={cardData}
          initialMode={modalMode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
