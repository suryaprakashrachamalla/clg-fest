"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { soundFx } from "@/utils/audio";
import { EventItemData } from "@/config/flagship-events";
import {
  X,
  Calendar,
  Users,
  Trophy,
  DollarSign,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from "lucide-react";

interface RegistrationModalProps {
  event: EventItemData | null;
  initialMode?: "register" | "rules";
  onClose: () => void;
}

export default function RegistrationModal({
  event,
  initialMode = "register",
  onClose,
}: RegistrationModalProps) {
  const [mode, setMode] = useState<"register" | "rules">(initialMode);

  if (!event) return null;

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Dialog Card */}
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 50, scale: 0.94, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
        exit={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(6px)", transition: { duration: 0.25 } }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-[#D4AF37]/30 bg-[#0A0F16] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden my-8"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#D4AF37] font-mono text-xs uppercase tracking-widest mb-1.5">
            <span>{event.category} DOMAIN</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">STATUS: {event.status}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
            {event.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-sans">
            {event.tagline}
          </p>
        </div>

        {/* Essential Event Metadata Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-[#053229]/40 border border-[#355E58]/60 text-xs font-mono mb-6">
          <div className="flex items-center gap-2 text-zinc-300">
            <Trophy className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">PRIZE POOL</div>
              <div className="font-bold text-[#D4AF37]">{event.prizePool}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Users className="w-4 h-4 text-sky-300 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">TEAM SIZE</div>
              <div className="font-bold text-white">{event.teamSizeLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <DollarSign className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">ENTRY FEE</div>
              <div className="font-bold text-[#D4AF37]">{event.entryFee}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Calendar className="w-4 h-4 text-rose-300 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">SCHEDULE</div>
              <div className="font-bold text-zinc-200">{event.date}</div>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs: [ REGISTER ] vs [ VIEW RULES ] */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-6 font-mono text-xs">
          <button
            onClick={() => {
              soundFx.playClickTone();
              setMode("register");
            }}
            className={`flex-1 py-2.5 rounded-lg font-bold transition ${
              mode === "register"
                ? "bg-gradient-to-r from-[#B89D47] via-[#D4AF37] to-[#B89D47] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            REGISTRATION OVERVIEW
          </button>
          <button
            onClick={() => {
              soundFx.playClickTone();
              setMode("rules");
            }}
            className={`flex-1 py-2.5 rounded-lg font-bold transition ${
              mode === "rules"
                ? "bg-gradient-to-r from-[#B89D47] via-[#D4AF37] to-[#B89D47] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            RULES &amp; CRITERIA
          </button>
        </div>

        {/* View Mode: RULES */}
        {mode === "rules" && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl border border-[#355E58]/40 bg-[#053229]/25">
              <h4 className="font-display font-bold text-sm text-[#D4AF37] mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                <span>COMPETITION RULES &amp; CODE OF CONDUCT</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside leading-relaxed font-sans">
                {event.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
                <li>All participants must carry their physical college ID card for physical on-campus verification.</li>
                <li>Decision of jury and faculty coordinators is final and binding.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <h4 className="font-display font-bold text-xs text-zinc-300 mb-2 uppercase tracking-wider">
                TECHNICAL PREREQUISITES &amp; SPECIFICATIONS
              </h4>
              <div className="flex flex-wrap gap-2">
                {event.specs.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#053229]/60 border border-[#355E58] text-xs font-mono text-emerald-300"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href={`/register/${event.slug}`}
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#B89D47] via-[#D4AF37] to-[#B89D47] text-black font-display font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-[0_0_20px_rgba(212,175,55,0.4)] text-center flex items-center justify-center gap-2"
              >
                <span>PROCEED TO OFFICIAL REGISTRATION</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* View Mode: REGISTRATION OVERVIEW */}
        {mode === "register" && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Official Slot Reservation &amp; Pass Issuance
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Registrations for {event.title} are processed with database-level atomic slot guarantees. Upon completing registration:
              </p>
              <ul className="text-xs text-zinc-400 space-y-1.5 font-mono list-disc list-inside">
                <li>Instant 256-bit cryptographically verified QR venue pass is issued.</li>
                <li>Downloadable high-resolution badge ready for mobile or print.</li>
                <li>Unique 6-character team invite code generated for teammates to join free.</li>
                <li>Official payment invoice and audit receipt provided.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#0E121B] border border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Venue: <strong className="text-white">{event.venue}</strong></span>
              </div>
              <div className="text-emerald-400 font-bold">
                ✓ Slots Currently Open
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/events/${event.slug}`}
                onClick={onClose}
                className="py-3.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-zinc-300 hover:text-white transition text-center flex items-center justify-center gap-1.5"
              >
                <span>FULL EVENT DETAILS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={`/register/${event.slug}`}
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#B89D47] via-[#D4AF37] to-[#B89D47] text-black font-display font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-[0_0_25px_rgba(212,175,55,0.4)] text-center flex items-center justify-center gap-2"
              >
                <span>PROCEED TO REGISTRATION</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
