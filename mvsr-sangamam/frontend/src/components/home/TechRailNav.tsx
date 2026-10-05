"use client";

import { useEffect, useState } from "react";
import { soundFx } from "@/utils/audio";

const SECTIONS = [
  { id: "events", label: "TRACKS" },
  { id: "schedule", label: "SCHEDULE" },
  { id: "about", label: "ABOUT" },
  { id: "faq", label: "FAQS" },
  { id: "contact", label: "CONTACT" },
];

export default function TechRailNav() {
  const [activeSection, setActiveSection] = useState("events");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    soundFx.playClickTone();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-3 select-none pointer-events-auto">
      <div className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#CFB97E]/70 [writing-mode:vertical-rl] rotate-180 mb-2">
        SYS_SECTOR
      </div>

      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            onMouseEnter={() => soundFx.playHoverBlip()}
            className="group flex items-center flex-row-reverse gap-3 py-1 cursor-pointer focus:outline-none"
            title={sec.label}
          >
            {/* Dot */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? "w-3 h-3 bg-[#B89D47] shadow-[0_0_12px_#B89D47] scale-125"
                  : "w-1.5 h-1.5 bg-zinc-600 group-hover:bg-[#CFB97E] group-hover:scale-110"
              }`}
            />

            {/* Label reveal on hover or active */}
            <span
              className={`font-mono text-[10px] tracking-widest uppercase transition-all duration-200 ${
                isActive
                  ? "text-[#B89D47] font-bold opacity-100 translate-x-0"
                  : "text-[#FFEDD1]/70 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
              }`}
            >
              {sec.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
