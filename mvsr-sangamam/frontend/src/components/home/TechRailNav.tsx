"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { soundFx } from "@/utils/audio";
import { scrollToId } from "@/components/motion/smooth-scroll";
import { EASE } from "@/components/motion/primitives";

const SECTIONS = [
  { id: "events", label: "TRACKS" },
  { id: "schedule", label: "SCHEDULE" },
  { id: "about", label: "ABOUT" },
  { id: "faqs", label: "FAQS" },
  { id: "contact", label: "CONTACT" },
];

export default function TechRailNav({ visible = true }: { visible?: boolean }) {
  const [activeSection, setActiveSection] = useState("events");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      aria-label="Section navigation"
      initial={{ opacity: 0, x: 30 }}
      animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
      transition={{ duration: 0.9, ease: EASE, delay: visible ? 2 : 0 }}
      style={{ y: "-50%" }}
      className="pointer-events-auto fixed right-4 top-1/2 z-40 hidden select-none flex-col items-end gap-3 md:flex sm:right-6"
    >
      <div className="mb-2 rotate-180 font-mono text-[9px] font-bold tracking-[0.25em] text-[#CFB97E]/70 [writing-mode:vertical-rl]">
        SYS_SECTOR
      </div>

      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => {
              soundFx.playClickTone();
              scrollToId(sec.id);
            }}
            onMouseEnter={() => soundFx.playHoverBlip()}
            className="group flex cursor-pointer flex-row-reverse items-center gap-3 py-1 focus:outline-none"
            title={sec.label}
          >
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 transition-colors group-hover:bg-[#CFB97E]" />
              {isActive && (
                <motion.span
                  layoutId="rail-active"
                  className="absolute inset-0 rounded-full bg-[#B89D47] shadow-[0_0_12px_#B89D47]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </span>
            <span
              className={`font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                isActive
                  ? "translate-x-0 font-bold text-[#B89D47] opacity-100"
                  : "translate-x-2 text-[#FFEDD1]/70 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              }`}
            >
              {sec.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
}
