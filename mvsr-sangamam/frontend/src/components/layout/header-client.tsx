"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LayoutDashboard, LogOut, Menu, ShieldCheck, X, Volume2, VolumeX, Sparkles, Terminal } from "lucide-react";
import { cx } from "@/lib/format";

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/#events", label: "EVENTS" },
  { href: "/events/hackathon", label: "HACKATHON" },
  { href: "/#schedule", label: "SCHEDULE" },
  { href: "/#about", label: "ABOUT" },
  { href: "/#faqs", label: "FAQS" },
  { href: "/#contact", label: "CONTACT" },
];

export function HeaderClient({ user }: { user: { name: string; role: string } | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Ambient Sci-Fi Audio Synthesizer (Techfest / Felicity style)
  const toggleSound = () => {
    if (!soundOn) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Subtle ambient sci-fi drone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(110, ctx.currentTime); // A2 drone

        gain.gain.setValueAtTime(0.015, ctx.currentTime); // very subtle, pleasant
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setSoundOn(true);
      } catch {
        setSoundOn(false);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
      setSoundOn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const isStaff = user && (user.role === "ADMIN" || user.role === "ORGANIZER");

  return (
    <header
      className={cx(
        "no-print fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-[#355E58]/30 bg-[#070B10]/90 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          : "bg-transparent border-b border-white/[0.04]",
      )}
    >
      <div className="container-x flex h-18 py-3.5 items-center justify-between gap-4">
        {/* Brand Logo with Glowing Cyber Accent */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="Sangamam home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#053229]/80 border border-[#CFB97E]/50 text-[#B89D47] font-mono font-black text-sm shadow-[0_0_15px_rgba(184,157,71,0.35)] group-hover:border-[#B89D47] transition">
            S
          </div>
          <div className="leading-none">
            <div className="font-cyber text-base font-black tracking-wider text-white flex items-center gap-1">
              SANGAMAM<span className="text-[#B89D47]">’26</span>
            </div>
            <div className="text-[9px] font-cyber font-bold uppercase tracking-[0.2em] text-[#CFB97E]/80 mt-0.5">
              HYDERABAD
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1.5 lg:flex font-cyber" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wider text-zinc-300 transition hover:bg-white/[0.06] hover:text-[#CFB97E]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="hidden items-center gap-2.5 lg:flex font-cyber">
          {/* Ambient Sound FX Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? "Mute ambient audio" : "Play ambient synth"}
            className={`p-2 rounded-xl border transition ${
              soundOn
                ? "bg-[#053229]/80 border-[#CFB97E]/60 text-[#CFB97E] shadow-[0_0_15px_rgba(184,157,71,0.25)]"
                : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {user ? (
            <>
              {isStaff && (
                <Link href="/admin" className="btn-subtle btn-sm text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#B89D47]" /> ADMIN
                </Link>
              )}
              <Link href="/dashboard" className="btn-ghost btn-sm text-[11px]">
                <LayoutDashboard className="h-3.5 w-3.5" /> DASHBOARD
              </Link>
              <button onClick={logout} className="btn-subtle btn-sm" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-ghost btn-sm text-[11px]">
              SIGN IN
            </Link>
          )}

          <Link
            href="/#events"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black font-cyber font-black text-[11px] tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(184,157,71,0.35)] transition"
          >
            REGISTER NOW
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400"
          >
            {soundOn ? <Volume2 className="h-4 w-4 text-[#CFB97E]" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            className="btn-subtle btn-sm"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-[#355E58]/30 bg-[#070B10]/98 backdrop-blur-2xl lg:hidden font-cyber">
          <nav className="container-x flex flex-col py-6" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/[0.06] py-4 text-base font-bold tracking-wider text-zinc-200 hover:text-[#CFB97E]"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-8 grid gap-3">
              <Link
                href="/#events"
                onClick={() => setOpen(false)}
                className="py-3 text-center rounded-xl bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black font-cyber font-black text-sm tracking-wider"
              >
                REGISTER NOW
              </Link>
              <Link href="/join" onClick={() => setOpen(false)} className="btn-ghost">
                JOIN WITH TEAM CODE
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-ghost">
                    <LayoutDashboard className="h-4 w-4" /> DASHBOARD
                  </Link>
                  {isStaff && (
                    <Link href="/admin" className="btn-ghost">
                      <ShieldCheck className="h-4 w-4" /> ADMIN CONSOLE
                    </Link>
                  )}
                  <button onClick={logout} className="btn-subtle">
                    SIGN OUT
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn-ghost">
                  SIGN IN
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
