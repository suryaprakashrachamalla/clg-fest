"use client";

import { useState, useEffect } from "react";
import { soundFx } from "@/utils/audio";
import { ArrowRight, Terminal, Sparkles, Shield, Cpu, Activity, RotateCcw, Volume2, VolumeX } from "lucide-react";

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
    <section id="hero" className="relative min-h-[92vh] flex flex-col justify-between pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top System Status Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-[#0A0F1C]/80 backdrop-blur-xl mb-12 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
          {/* Status 1: System */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[11px]">SYSTEM STATUS:</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ONLINE
            </span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          {/* Status 2: Registration */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[11px]">EVENT REGISTRATION:</span>
            <span className="flex items-center gap-1.5 text-[#CFB97E] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#B89D47] animate-pulse" />
              OPEN
            </span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          {/* Status 3: Participants */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[11px]">PARTICIPANTS:</span>
            <span className="text-white font-bold">2,481</span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          {/* Status 4: Events */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[11px]">EVENTS:</span>
            <span className="text-[#B89D47] font-bold">32</span>
          </div>
        </div>

        {/* Quick controls: Audio & Replay Boot */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#355E58]/50 bg-[#053229]/40 hover:border-[#CFB97E] text-xs font-mono text-zinc-300 transition"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#CFB97E]" />}
            <span className="text-[10px]">{audioMuted ? "MUTED" : "SOUND ON"}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClickTone();
              onReplayIntro();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CFB97E]/30 bg-[#B89D47]/10 text-[#CFB97E] hover:bg-[#B89D47]/20 text-xs font-mono transition"
            title="Replay Cinematic Photo Intro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">REPLAY INTRO</span>
          </button>

        </div>
      </div>

      {/* Main Hero Centerpiece */}
      <div className="text-center max-w-4xl mx-auto my-auto py-8">
        {/* Department Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#CFB97E]/35 bg-[#053229]/60 text-[#CFB97E] font-mono text-xs tracking-[0.25em] uppercase mb-6 shadow-[0_0_20px_rgba(184,157,71,0.15)]">
          <Terminal className="w-3.5 h-3.5 text-[#B89D47]" />
          <span>DEPT. OF COMPUTER SCIENCE & ENGINEERING</span>
        </div>

        {/* Heading: Fest Name */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-cyber text-white tracking-tight leading-[1.05]">
          SANGAMAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#FE9179]">2026</span>
        </h1>

        {/* Large Subtitle: COMPUTE. CREATE. COMPETE. */}
        <div className="mt-4 text-xl sm:text-3xl font-cyber font-bold tracking-[0.2em] text-[#CFB97E] uppercase">
          COMPUTE. CREATE. COMPETE.
        </div>

        {/* Supporting text */}
        <p className="mt-4 text-base sm:text-lg text-[#FFEDD1]/80 font-sans italic max-w-2xl mx-auto">
          &ldquo;Where code meets creativity.&rdquo;
        </p>

        {/* Action Buttons: [ EXPLORE EVENTS ] and [ REGISTER NOW ] */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={() => {
              soundFx.playClickTone();
              onExploreEvents();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-cyber font-bold text-xs sm:text-sm tracking-widest uppercase border border-[#CFB97E]/40 bg-[#053229]/60 hover:bg-[#053229]/90 text-[#FFEDD1] hover:text-white transition-all shadow-[0_0_25px_rgba(207,185,126,0.15)] flex items-center justify-center gap-3"
          >
            <span>EXPLORE EVENTS</span>
            <ArrowRight className="w-4 h-4 text-[#B89D47]" />
          </button>

          <button
            onClick={() => {
              soundFx.playClickTone();
              onOpenRegister();
            }}
            className="w-full sm:w-auto px-9 py-4 rounded-xl font-cyber font-black text-xs sm:text-sm tracking-widest uppercase bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black hover:brightness-110 shadow-[0_0_35px_rgba(184,157,71,0.4)] hover:shadow-[0_0_45px_rgba(184,157,71,0.7)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>REGISTER NOW</span>
            <Sparkles className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Bottom Live Countdown Timer & Telemetry Box */}
      <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#B89D47] animate-pulse" />
          <span>FEST COMMENCEMENT:</span>
          <span className="text-white font-bold">17–18 OCTOBER 2026</span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-400">HYDERABAD, INDIA</span>
        </div>

        {/* Live Countdown Grid */}
        <div className="flex items-center gap-3 text-center">
          <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
            <span className="text-white font-bold text-sm block font-cyber">{countdown.days}</span>
            <span className="text-[9px] text-zinc-500">DAYS</span>
          </div>
          <span className="text-zinc-600">:</span>
          <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
            <span className="text-white font-bold text-sm block font-cyber">{countdown.hours}</span>
            <span className="text-[9px] text-zinc-500">HRS</span>
          </div>
          <span className="text-zinc-600">:</span>
          <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
            <span className="text-white font-bold text-sm block font-cyber">{countdown.minutes}</span>
            <span className="text-[9px] text-zinc-500">MIN</span>
          </div>
          <span className="text-zinc-600">:</span>
          <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
            <span className="text-[#B89D47] font-bold text-sm block font-cyber">{countdown.seconds}</span>
            <span className="text-[9px] text-zinc-500">SEC</span>
          </div>
        </div>
      </div>
    </section>
  );
}
