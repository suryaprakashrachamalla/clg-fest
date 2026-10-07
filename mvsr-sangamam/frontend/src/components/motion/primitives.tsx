"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type Variants,
} from "motion/react";

export const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
  amount?: number;
};

export function Reveal({ children, className, delay = 0, x = 0, y = 36, scale = 1, amount = 0.25 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y, scale, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE }, transitionEnd: { filter: "none" } },
};

export function Stagger({
  children,
  className,
  stagger = 0.1,
  delay = 0,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

const wordVariants: Variants = {
  hidden: { y: "115%", rotate: 4 },
  show: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE } },
};

/** Masked word-by-word rise. `play` controls it manually; omit it to trigger on scroll into view. */
export function SplitWords({
  text,
  className,
  wordClassName,
  stagger = 0.07,
  delay = 0,
  play,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  stagger?: number;
  delay?: number;
  play?: boolean;
}) {
  const control =
    play === undefined
      ? { whileInView: "show", viewport: { once: true, amount: 0.6 } }
      : { animate: play ? "show" : "hidden" };
  return (
    <motion.span
      className={className}
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      aria-label={text}
      {...control}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span className={`inline-block will-change-transform ${wordClassName ?? ""}`} variants={wordVariants}>
            {word}
            {i < text.split(" ").length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export function SectionHeading({
  eyebrow,
  icon,
  title,
  accent,
  sub,
  align = "center",
}: {
  eyebrow: string;
  icon?: React.ReactNode;
  title: string;
  accent: string;
  sub?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center max-w-3xl mx-auto mb-14" : "mb-8"}>
      <motion.div
        initial={{ opacity: 0, y: 12, letterSpacing: "0.5em" }}
        whileInView={{ opacity: 1, y: 0, letterSpacing: "0.2em" }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.1, ease: EASE }}
        className={`eyebrow text-[#CFB97E] ${centered ? "justify-center" : ""}`}
      >
        {icon}
        {eyebrow}
      </motion.div>
      <h2 className="section-title">
        <SplitWords text={title} />{" "}
        <SplitWords
          text={accent}
          delay={0.12}
          wordClassName="text-transparent bg-clip-text bg-gradient-to-r from-[#B89D47] via-[#F4E3BA] to-[#B89D47] bg-[length:200%_auto] animate-shimmer"
        />
      </h2>
      <motion.div
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
        className={`mt-5 h-px w-28 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent ${centered ? "mx-auto" : "origin-left"}`}
      />
      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          className={`section-sub ${centered ? "mx-auto" : ""}`}
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 2.2,
  play = true,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  play?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const fmt = (v: number) => `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || !play) return;
    if (reduce) {
      el.textContent = fmt(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => (el.textContent = fmt(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, play, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {fmt(0)}
    </span>
  );
}

/** 3D pointer tilt with a cursor-following gold spotlight. */
export function TiltCard({ children, className, max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${gx} ${gy}, rgba(212,175,55,0.16), transparent 55%)`;

  return (
    <motion.div
      className={`group/tilt relative [transform-style:preserve-3d] ${className ?? ""}`}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
        style={{ background: spotlight }}
      />
    </motion.div>
  );
}

/** Element drifts toward the cursor while hovered. */
export function Magnetic({ children, strength = 0.3, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.div
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/** Infinite marquee whose speed, direction and skew react to scroll velocity. */
export function VelocityMarquee({ children, baseVelocity = 3 }: { children: React.ReactNode; baseVelocity?: number }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const skewX = useTransform(velocity, [-2500, 2500], [10, -10]);
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const scrollDir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) scrollDir.current = -1;
    else if (f > 0) scrollDir.current = 1;
    const moveBy = scrollDir.current * baseVelocity * (delta / 1000) * (1 + Math.abs(f));
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div className="flex shrink-0 whitespace-nowrap" style={{ x, skewX }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} aria-hidden={i > 0} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/** Thin gold rule that draws outward from the centre as it enters view. */
export function SectionDivider() {
  return (
    <div className="container-x" aria-hidden>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
        className="relative h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
      >
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#D4AF37] shadow-[0_0_14px_#D4AF37]" />
      </motion.div>
    </div>
  );
}
