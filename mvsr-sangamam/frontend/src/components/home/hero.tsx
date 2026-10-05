"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  Trophy,
  Users,
  Zap,
  Terminal,
  Radio,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { CountdownTimer } from "../common/countdown-timer";
import { FEST } from "@/config/fest";

interface StatsProps {
  events: number;
  categories: number;
  participants: number;
  hackathonTeamLimit: number;
  firstPrize: number;
}

export function Hero({ stats }: { stats: StatsProps }) {
  return (
    <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden pt-28 pb-20">
      {/* 1. Perspective 3D Grid Floor (Synthwave / Infinium style) */}
      <div className="perspective-grid">
        <div className="grid-plane" />
      </div>

      {/* 2. Cyberpunk Laser Ambient Flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-brand-cyan/20 via-brand-violet/25 to-brand-fuchsia/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-brand-cyan/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-fuchsia/15 rounded-full blur-[120px] pointer-events-none" />

      {/* 3. Subtle HUD Grid Lines */}
      <div className="absolute inset-0 bg-grid opacity-20 mask-fade-b pointer-events-none" />

      <div className="container-x relative z-10 flex flex-col items-center text-center">
        {/* Top Telemetry Chip */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-ink-900/90 border border-brand-cyan/30 backdrop-blur-xl shadow-lg shadow-brand-cyan/10 mb-6 group hover:border-brand-cyan transition duration-300">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-cyan" />
          </div>
          <span className="font-cyber text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-300">
            SYS.ONLINE // MVSR ENGINEERING COLLEGE PRESENTS
          </span>
        </div>



        {/* Main Title - Massive Futuristic Orbitron / Space Typography */}
        <div className="space-y-3 max-w-5xl">
          <div className="eyebrow justify-center">
            <Cpu className="w-4 h-4 text-brand-cyan" />
            NATIONAL TECHNO-CULTURAL FESTIVAL • 2026 EDITION
          </div>

          <h1 className="text-4xl sm:text-7xl md:text-8xl font-cyber font-black tracking-wider text-white uppercase leading-none text-glow-cyan">
            MVSR <span className="text-gradient">SANGAMAM</span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto font-sans font-normal pt-2 leading-relaxed">
            Where code, culture & creativity converge. Step into the arena of 24-hour hackathons, robotics, competitive coding, and high-octane esports.
          </p>
        </div>

        {/* Dates & Location Cyber HUD Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 mb-8 text-xs font-cyber">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900/90 border border-brand-fuchsia/40 text-brand-fuchsia shadow-lg shadow-brand-fuchsia/10">
            <Calendar className="w-4 h-4" />
            <span className="font-bold tracking-wider">17TH–18TH OCTOBER 2026</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900/90 border border-brand-cyan/40 text-brand-cyan shadow-lg shadow-brand-cyan/10">
            <MapPin className="w-4 h-4" />
            <span className="font-bold tracking-wider">MVSR CAMPUS · NADERGUL, HYD</span>
          </div>
        </div>

        {/* Holographic Cash Prize Banner */}
        <div className="relative mb-10 group cursor-default">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 rounded-2xl blur-md opacity-40 group-hover:opacity-80 transition duration-500" />
          <div className="relative px-6 py-3.5 rounded-2xl bg-ink-950/95 border border-amber-400/50 flex items-center gap-3.5 text-center shadow-2xl">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-cyber font-extrabold uppercase tracking-widest text-amber-400">
                FLAGSHIP HACKATHON REWARD POOL
              </div>
              <div className="text-base sm:text-xl font-cyber font-black text-white text-glow-amber">
                1ST WINNER PRIZE: <span className="text-amber-300">₹20,000 CASH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Futuristic Countdown Timer */}
        <div className="w-full max-w-xl mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Radio className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            <span className="text-[10px] font-cyber uppercase tracking-[0.3em] text-zinc-400 font-bold">
              REGISTRATION PROTOCOL CLOSES IN
            </span>
          </div>
          <CountdownTimer targetDate={FEST.startsAt} />
        </div>

        {/* Futuristic CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/events/hackathon"
            className="btn-cyan px-8 py-4 text-xs sm:text-sm rounded-xl font-cyber font-black flex items-center gap-2.5 shadow-neon-cyan hover:scale-105 transition"
          >
            <Zap className="w-4 h-4" />
            ENTER HACKATHON
          </Link>

          <Link
            href="/#events"
            className="btn-primary px-7 py-4 text-xs sm:text-sm rounded-xl font-cyber font-bold flex items-center gap-2 shadow-neon-violet hover:scale-105 transition"
          >
            EXPLORE ALL EVENTS
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/join"
            className="btn-ghost px-6 py-4 text-xs sm:text-sm rounded-xl font-cyber font-bold flex items-center gap-2 text-zinc-200 hover:text-white"
          >
            <Users className="w-4 h-4 text-brand-cyan" />
            JOIN TEAM WITH CODE
          </Link>
        </div>

        {/* 4 Cyberpunk Telemetry HUD Metric Boxes */}
        <div className="w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cyber-card p-5 text-left flex items-start gap-3.5 hover:border-brand-cyan/50 transition">
            <div className="p-2.5 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-cyber font-black text-white text-glow-cyan">
                {stats.events}+
              </div>
              <div className="text-[11px] font-cyber text-zinc-400 uppercase tracking-wider mt-0.5">
                Competitions
              </div>
            </div>
          </div>

          <div className="cyber-card p-5 text-left flex items-start gap-3.5 hover:border-brand-fuchsia/50 transition">
            <div className="p-2.5 rounded-xl bg-brand-fuchsia/15 border border-brand-fuchsia/30 text-brand-fuchsia">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-cyber font-black text-white text-glow-fuchsia">
                50 TEAMS
              </div>
              <div className="text-[11px] font-cyber text-zinc-400 uppercase tracking-wider mt-0.5">
                Hackathon Cap
              </div>
            </div>
          </div>

          <div className="cyber-card p-5 text-left flex items-start gap-3.5 hover:border-brand-violet/50 transition">
            <div className="p-2.5 rounded-xl bg-brand-violet/15 border border-brand-violet/30 text-brand-violet">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-cyber font-black text-white text-glow-violet">
                {stats.participants > 0 ? stats.participants : "500+"}
              </div>
              <div className="text-[11px] font-cyber text-zinc-400 uppercase tracking-wider mt-0.5">
                Contenders
              </div>
            </div>
          </div>

          <div className="cyber-card p-5 text-left flex items-start gap-3.5 hover:border-amber-400/50 transition">
            <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-cyber font-black text-amber-300 text-glow-amber">
                ₹{stats.firstPrize.toLocaleString()}
              </div>
              <div className="text-[11px] font-cyber text-zinc-400 uppercase tracking-wider mt-0.5">
                1st Prize Pool
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
