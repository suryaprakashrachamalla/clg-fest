"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { soundFx } from "@/utils/audio";
import { FEST } from "@/config/fest";
import { CountUp, EASE, Magnetic } from "@/components/motion/primitives";
import { ArrowRight, Sparkles, Calendar, MapPin, Volume2, VolumeX, RotateCcw, Trophy, Users, Layers, Timer } from "lucide-react";

interface FuturisticHeroProps {
  ready: boolean;
  onExploreEvents: () => void;
  onOpenRegister: () => void;
  onReplayIntro: () => void;
}

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function useCountdown(targetIso: string) {
  const [left, setLeft] = useState<Remaining | null>(null);
  useEffect(() => {
    const end = new Date(targetIso).getTime();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return left;
}

function FlipUnit({ value, label, accent }: { value?: number; label: string; accent?: boolean }) {
  const text = value === undefined ? "--" : String(value).padStart(2, "0");
  return (
    <div className="w-[58px] sm:w-[68px] rounded-xl border border-white/[0.08] bg-[#0F1320]/80 px-2 py-2 text-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="relative h-6 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`block font-display text-lg font-bold tabular-nums leading-6 ${accent ? "text-[#D4AF37]" : "text-white"}`}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-medium tracking-[0.2em] text-zinc-500">{label}</span>
    </div>
  );
}

const rise = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.1, ease: EASE, delay }, transitionEnd: { filter: "none" } },
});

const STATS = [
  { icon: Trophy, to: 150000, prefix: "₹", suffix: "+", label: "Prize Pool" },
  { icon: Layers, to: 13, suffix: " Events", label: "Tech & Cultural" },
  { icon: Users, to: 2500, suffix: "+", label: "Participants" },
  { icon: Sparkles, to: 24, suffix: " Hours", label: "Hackathon Non-Stop" },
];

export default function FuturisticHero({ ready, onExploreEvents, onOpenRegister, onReplayIntro }: FuturisticHeroProps) {
  const [audioMuted, setAudioMuted] = useState(soundFx.getMuted());
  const countdown = useCountdown(FEST.startsAt);
  const state = ready ? "show" : "hidden";

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const orbUp = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const orbDown = useTransform(scrollYProgress, [0, 1], [0, 180]);

  const mx = useMotionValue(50);
  const my = useMotionValue(38);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const aurora = useMotionTemplate`radial-gradient(650px circle at ${sx}% ${sy}%, rgba(212,175,55,0.12), transparent 60%)`;

  const toggleSound = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    soundFx.setMuted(next);
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative overflow-hidden"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      {/* Ambient layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div className="absolute inset-0" style={{ background: aurora }} />
        <motion.div
          style={{ y: orbUp }}
          className="absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-[#355E58]/25 blur-[120px]"
        />
        <motion.div
          style={{ y: orbDown }}
          className="absolute -right-24 top-1/3 h-[460px] w-[460px] rounded-full bg-[#D4AF37]/10 blur-[130px]"
        />
        <motion.div
          className="absolute left-1/2 top-[44%] h-[min(720px,140vw)] w-[min(720px,140vw)] rounded-full [background:conic-gradient(from_0deg,transparent_0%,rgba(212,175,55,0.35)_12%,transparent_30%,rgba(53,94,88,0.45)_55%,transparent_70%,rgba(254,145,121,0.2)_85%,transparent_100%)] [mask-image:radial-gradient(circle,transparent_58%,black_59%,black_60%,transparent_68%)]"
          style={{ x: "-50%", y: "-50%" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={ready ? { opacity: 0.5, scale: 1, rotate: 360 } : { opacity: 0, scale: 0.8 }}
          transition={{
            opacity: { duration: 2, ease: EASE, delay: 0.4 },
            scale: { duration: 2, ease: EASE, delay: 0.4 },
            rotate: { duration: 50, ease: "linear", repeat: Infinity },
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#08090E]/80" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        {/* Top info bar */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="mb-8 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0E1320]/60 p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-3"
        >
          <div className="flex items-center gap-2 text-xs text-zinc-300 sm:gap-3">
            <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              REGISTRATIONS OPEN
            </span>
            <span className="hidden text-zinc-600 md:inline">·</span>
            <span className="hidden items-center gap-1.5 text-xs text-zinc-400 md:flex">
              <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
              {FEST.dateLabel}
            </span>
            <span className="hidden text-zinc-600 md:inline">·</span>
            <span className="hidden items-center gap-1.5 text-xs text-zinc-400 md:flex">
              <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
              MVSR Engineering College, Hyderabad
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              {audioMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[#D4AF37]" />}
              <span className="text-[11px] font-medium">{audioMuted ? "Muted" : "Sound"}</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClickTone();
                onReplayIntro();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-2.5 py-1 text-xs text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
              title="Replay Festival Video Intro"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold">Intro</span>
            </button>
          </div>
        </motion.div>

        {/* Centre stage */}
        <motion.div
          style={{ y: contentY, scale: contentScale, opacity: contentOpacity }}
          className="mx-auto my-auto max-w-5xl py-6 text-center sm:py-10"
        >
          <motion.div
            variants={rise(0.2)}
            initial="hidden"
            animate={state}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37] backdrop-blur-md sm:text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Department of Computer Science &amp; Engineering</span>
          </motion.div>

          <h1
            aria-label={`Sangamam ${FEST.edition}`}
            className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl lg:text-8xl"
          >
            <span aria-hidden className="inline-block whitespace-nowrap">
              {"SANGAMAM".split("").map((ch, i) => (
                <span key={i} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%", rotate: 8 }}
                    animate={ready ? { y: "0%", rotate: 0 } : { y: "110%", rotate: 8 }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.35 + i * 0.055 }}
                  >
                    {ch}
                  </motion.span>
                </span>
              ))}
            </span>{" "}
            <span aria-hidden className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
              <motion.span
                className="inline-block bg-gradient-to-r from-[#F4E3BA] via-[#D4AF37] to-[#F4E3BA] bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer"
                initial={{ y: "110%" }}
                animate={ready ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.85 }}
              >
                {FEST.edition}
              </motion.span>
            </span>
          </h1>

          <motion.div
            variants={rise(1.05)}
            initial="hidden"
            animate={state}
            className="mt-5 flex items-center justify-center gap-3 font-sans text-lg font-medium tracking-wide text-zinc-200 sm:text-2xl"
          >
            {["Compute", "Create", "Compete"].map((w, i) => (
              <span key={w} className="flex items-center gap-3">
                {i > 0 && <span className="h-1.5 w-1.5 rotate-45 bg-[#D4AF37]/70" />}
                {w}
              </span>
            ))}
          </motion.div>

          <motion.p
            variants={rise(1.2)}
            initial="hidden"
            animate={state}
            className="mx-auto mt-5 max-w-2xl text-base font-normal leading-relaxed text-zinc-400 sm:text-lg"
          >
            The premier annual national fest and 24-hour hackathon. Join 2,500+ students from across India for two days
            of breakthrough code, electrifying live music, and stand-up comedy.
          </motion.p>

          <motion.div
            variants={rise(1.35)}
            initial="hidden"
            animate={state}
            className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:mt-11 sm:flex-row sm:gap-5"
          >
            <Magnetic className="w-full sm:w-auto">
              <button
                onClick={() => {
                  soundFx.playClickTone();
                  onOpenRegister();
                }}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#F4E3BA] via-[#D4AF37] to-[#C99D42] px-8 py-3.5 text-sm font-semibold tracking-wide text-black shadow-[0_4px_24px_rgba(212,175,55,0.3)] transition-shadow hover:shadow-[0_8px_40px_rgba(212,175,55,0.5)] active:scale-95 sm:w-auto"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                <span className="relative">Register Now</span>
                <Sparkles className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
              </button>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto" strength={0.2}>
              <button
                onClick={() => {
                  soundFx.playClickTone();
                  onExploreEvents();
                }}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:border-[#D4AF37]/40 hover:bg-white/[0.08] sm:w-auto"
              >
                <span>Explore Events &amp; Schedule</span>
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#D4AF37]" />
              </button>
            </Magnetic>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  variants={rise(1.5 + i * 0.1)}
                  initial="hidden"
                  animate={state}
                  whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 18 } }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-center backdrop-blur-md transition-colors hover:border-[#D4AF37]/30"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Icon className="mx-auto mb-1.5 h-4 w-4 text-[#D4AF37] opacity-80 transition-transform duration-500 group-hover:scale-125" />
                  <div className="font-display text-base font-bold text-white sm:text-lg">
                    <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} play={ready} />
                  </div>
                  <div className="text-[11px] text-zinc-400">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          variants={rise(1.9)}
          initial="hidden"
          animate={state}
          className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-zinc-400 sm:flex-row"
        >
          <div className="flex items-center gap-2 font-medium">
            <Timer className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-zinc-300">COMMENCING IN</span>
            <span className="font-normal text-zinc-500">· {FEST.dateLabel}</span>
          </div>

          <button
            onClick={onExploreEvents}
            aria-label="Scroll to events"
            className="hidden flex-col items-center gap-1.5 text-[9px] font-semibold tracking-[0.3em] text-zinc-500 transition hover:text-[#D4AF37] lg:flex"
          >
            <span className="flex h-8 w-5 justify-center rounded-full border border-current pt-1.5">
              <motion.span
                className="h-1.5 w-1 rounded-full bg-[#D4AF37]"
                animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            SCROLL
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <FlipUnit value={countdown?.days} label="DAYS" />
            <span className="font-bold text-zinc-600">:</span>
            <FlipUnit value={countdown?.hours} label="HOURS" />
            <span className="font-bold text-zinc-600">:</span>
            <FlipUnit value={countdown?.minutes} label="MINS" />
            <span className="font-bold text-zinc-600">:</span>
            <FlipUnit value={countdown?.seconds} label="SECS" accent />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
