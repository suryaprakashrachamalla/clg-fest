"use client";

import { motion } from "motion/react";
import { Award, Code2, Globe2, Sparkles, Users } from "lucide-react";
import { FEST } from "@/config/fest";
import { EASE, Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/motion/primitives";

const HIGHLIGHTS = [
  { icon: Award, color: "#CFB97E", title: "Prestigious Legacy", body: "40+ years of educational excellence at MVSR" },
  { icon: Code2, color: "#D4AF37", title: "Flagship Hackathon", body: "50 hand-picked teams battling for ₹50,000" },
];

const FACTS = [
  {
    icon: Users,
    color: "#BCDDDC",
    title: "Inter-College Participation:",
    body: "Open to students from all engineering and arts colleges across India.",
  },
  {
    icon: Globe2,
    color: "#FE9179",
    title: "World-Class Infrastructure:",
    body: "High-speed campus Wi-Fi, air-conditioned seminar halls, innovation incubation labs, and spacious open-air theatres.",
  },
  {
    icon: Sparkles,
    color: "#D4AF37",
    title: "Industry Judging:",
    body: "Panels featuring startup founders, senior software engineers, and alumni leaders.",
  },
];

export function AboutSection() {
  return (
    <section className="section container-x">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <SectionHeading
            align="left"
            eyebrow="Legacy of excellence"
            icon={<Sparkles className="h-3.5 w-3.5 text-[#B89D47]" />}
            title="About"
            accent={FEST.name}
          />

          <Reveal x={-40} y={0}>
            <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">
              MVSR Sangamam is the premier national-level annual techno-cultural symposium organized by{" "}
              <span className="font-semibold text-white">Maturi Venkata Subba Rao (MVSR) Engineering College</span> in
              Nadergul, Hyderabad.
            </p>
          </Reveal>

          <Reveal x={-40} y={0} delay={0.1}>
            <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              Over the span of two electrifying days on <strong className="text-[#F4E3BA]">16th &amp; 17th October</strong>,
              Sangamam brings together thousands of students, developers, creators, and enthusiasts from across the
              nation to collaborate, compete, and celebrate technological innovation.
            </p>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-4 pt-4" stagger={0.12}>
            {HIGHLIGHTS.map(({ icon: Icon, color, title, body }) => (
              <StaggerItem key={title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group h-full rounded-2xl border border-[#355E58]/40 bg-[#0A0F16]/90 p-4 transition-colors hover:border-[#D4AF37]/40"
                >
                  <Icon
                    className="mb-2 h-6 w-6 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110"
                    style={{ color }}
                  />
                  <div className="font-display text-base font-bold text-white">{title}</div>
                  <div className="mt-1 text-xs text-zinc-400">{body}</div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 2, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, x: 0, rotate: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative"
        >
          <motion.div
            aria-hidden
            animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.04, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#053229]/40 via-[#355E58]/30 to-[#B89D47]/20 blur-2xl"
          />

          <div className="relative space-y-6 overflow-hidden rounded-3xl border border-[#355E58]/40 bg-[#0A0F16]/95 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
            <div className="border-b border-white/10 pb-6">
              <h3 className="font-display text-xl font-bold text-white">MVSR Engineering College</h3>
              <p className="text-xs text-zinc-400">Nadergul, Balapur Mandal, Hyderabad, Telangana</p>
            </div>

            <Stagger className="space-y-4 text-sm text-zinc-300" stagger={0.12} delay={0.3}>
              {FACTS.map(({ icon: Icon, color, title, body }) => (
                <StaggerItem key={title} className="flex items-start gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]"
                    style={{ color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <strong className="text-white">{title}</strong> {body}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
