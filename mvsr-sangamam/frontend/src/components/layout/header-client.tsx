"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LayoutDashboard, LogOut, Menu, ShieldCheck, X, Volume2, VolumeX, Sparkles, Terminal } from "lucide-react";
import { cx } from "@/lib/format";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#events", label: "Events" },
  { href: "/events/hackathon", label: "Hackathon" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/#about", label: "About" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/#contact", label: "Contact" },
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
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-[#D4AF37]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {isStaff && (
                <Link href="/admin" className="btn-subtle text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" /> Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn-ghost text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <button onClick={logout} className="btn-subtle p-2 rounded-lg text-zinc-400 hover:text-white" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-ghost text-xs px-3.5 py-2 rounded-lg font-medium text-zinc-300 hover:text-white">
              Sign In
            </Link>
          )}

          <Link
            href="/#events"
            className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/15"
          >
            Register Pass
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="btn-subtle p-2 rounded-lg"
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
        <div className="h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/10 bg-[#08090E]/98 backdrop-blur-2xl lg:hidden">
          <nav className="container-x flex flex-col py-6" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/[0.06] py-3.5 text-sm font-medium text-zinc-200 hover:text-[#D4AF37]"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-6 grid gap-2.5">
              <Link
                href="/#events"
                onClick={() => setOpen(false)}
                className="btn-primary py-3 text-center rounded-xl font-bold text-sm"
              >
                Register Pass
              </Link>
              <Link href="/join" onClick={() => setOpen(false)} className="btn-ghost text-center text-sm py-2.5">
                Join with Team Code
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-ghost flex items-center justify-center gap-2 text-sm py-2.5">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  {isStaff && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="btn-ghost flex items-center justify-center gap-2 text-sm py-2.5">
                      <ShieldCheck className="h-4 w-4" /> Admin Console
                    </Link>
                  )}
                  <button onClick={logout} className="btn-subtle py-2.5 text-sm">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost text-center text-sm py-2.5">
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
