"use client";

import { useState, useEffect } from "react";
import { soundFx } from "@/utils/audio";
import { ArrowRight, Sparkles, Calendar, MapPin, Volume2, VolumeX, RotateCcw, Trophy, Users, Layers } from "lucide-react";

interface FuturisticHeroProps {
  onExploreEvents: () => void;
  onOpenRegister: () => void;
  onReplayIntro: () => void;
}

export default function FuturisticHero({
  onExploreEvents,
  onOpenRegister,
  onReplayIntro,
}: FuturisticHeroProps) {
  const [countdown, setCountdown] = useState({ days: 11, hours: 14, minutes: 32, seconds: 45 });
  const [audioMuted, setAudioMuted] = useState(soundFx.getMuted());

  // Countdown timer to fest start (17 Oct 2026)
  useEffect(() => {
    const target = new Date("2026-10-17T09:00:00+05:30").getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    soundFx.setMuted(next);
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner Navigation Pill */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border border-white/[0.08] bg-[#0E1320]/60 backdrop-blur-xl mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        {/* Date & Location Pill */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-300">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            REGISTRATIONS OPEN
          </span>
          <span className="hidden md:inline text-zinc-600">·</span>
          <span className="hidden md:flex items-center gap-1.5 text-zinc-400 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            17–18 October 2026
          </span>
          <span className="hidden md:inline text-zinc-600">·</span>
          <span className="hidden md:flex items-center gap-1.5 text-zinc-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            MVSR Engineering College, Hyderabad
          </span>
        </div>

        {/* Quick Ambient Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] hover:border-white/20 text-xs text-zinc-400 hover:text-white transition"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
            <span className="text-[11px] font-medium">{audioMuted ? "Muted" : "Sound"}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClickTone();
              onReplayIntro();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs transition"
            title="Replay Festival Video Intro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Intro</span>
          </button>
        </div>
      </div>

      {/* Main Center Hero */}
      <div className="text-center max-w-4xl mx-auto my-auto py-6 sm:py-10">
        {/* Department Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</span>
        </div>

        {/* Main Fest Heading */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold text-white tracking-tight leading-[1.05]">
          SANGAMAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4E3BA] via-[#D4AF37] to-[#C99D42]">2026</span>
        </h1>

        {/* Refined Subtitle */}
        <div className="mt-4 text-lg sm:text-2xl font-sans font-medium tracking-wide text-zinc-200">
          Compute · Create · Compete
        </div>

        {/* Narrative description */}
        <p className="mt-4 text-base sm:text-lg text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed">
          The premier annual national fest and 24-hour hackathon. Join 2,500+ students from across India for two days of breakthrough code, electrifying live music, and stand-up comedy.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
          <button
            onClick={() => {
              soundFx.playClickTone();
              onOpenRegister();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-[#F4E3BA] via-[#D4AF37] to-[#C99D42] text-black hover:brightness-105 shadow-[0_4px_24px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.45)] transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>Register Now</span>
            <Sparkles className="w-4 h-4 text-black" />
          </button>

          <button
            onClick={() => {
              soundFx.playClickTone();
              onExploreEvents();
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm tracking-wide border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2"
          >
            <span>Explore Events & Schedule</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Key Highlights Metrics Pill */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md text-center">
            <Trophy className="w-4 h-4 text-[#D4AF37] mx-auto mb-1 opacity-80" />
            <div className="text-white font-bold text-base">₹1,50,000+</div>
            <div className="text-[11px] text-zinc-400">Prize Pool</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md text-center">
            <Layers className="w-4 h-4 text-[#D4AF37] mx-auto mb-1 opacity-80" />
            <div className="text-white font-bold text-base">13 Events</div>
            <div className="text-[11px] text-zinc-400">Tech & Cultural</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md text-center">
            <Users className="w-4 h-4 text-[#D4AF37] mx-auto mb-1 opacity-80" />
            <div className="text-white font-bold text-base">2,500+</div>
            <div className="text-[11px] text-zinc-400">Participants</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md text-center">
            <Sparkles className="w-4 h-4 text-[#D4AF37] mx-auto mb-1 opacity-80" />
            <div className="text-white font-bold text-base">24 Hours</div>
            <div className="text-[11px] text-zinc-400">Hackathon Non-Stop</div>
          </div>
        </div>
      </div>

      {/* Bottom Soft Live Countdown Timepiece */}
      <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
          <span className="text-zinc-300">COMMENCING IN:</span>
          <span className="text-zinc-500 font-normal">October 17–18, 2026</span>
        </div>

        {/* Clean, Soft Countdown Display */}
        <div className="flex items-center gap-2 text-center" suppressHydrationWarning>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0F1320]/80 border border-white/[0.08] backdrop-blur-md shadow-sm">
            <span className="text-white font-bold text-sm block font-sans">{countdown.days}</span>
            <span className="text-[9px] text-zinc-500 font-medium">DAYS</span>
          </div>
          <span className="text-zinc-600 font-bold">:</span>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0F1320]/80 border border-white/[0.08] backdrop-blur-md shadow-sm">
            <span className="text-white font-bold text-sm block font-sans">{countdown.hours}</span>
            <span className="text-[9px] text-zinc-500 font-medium">HOURS</span>
          </div>
          <span className="text-zinc-600 font-bold">:</span>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0F1320]/80 border border-white/[0.08] backdrop-blur-md shadow-sm">
            <span className="text-white font-bold text-sm block font-sans">{countdown.minutes}</span>
            <span className="text-[9px] text-zinc-500 font-medium">MINS</span>
          </div>
          <span className="text-zinc-600 font-bold">:</span>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0F1320]/80 border border-white/[0.08] backdrop-blur-md shadow-sm">
            <span className="text-[#D4AF37] font-bold text-sm block font-sans">{countdown.seconds}</span>
            <span className="text-[9px] text-zinc-500 font-medium">SECS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
