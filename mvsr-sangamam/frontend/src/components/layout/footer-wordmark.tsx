"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["45%", "0%"]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["0.3em", "0.02em"]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none select-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.4 }}
        style={{
          y,
          letterSpacing,
          color: "transparent",
          WebkitTextStroke: "1px rgba(212,175,55,0.4)",
          backgroundImage: "linear-gradient(180deg, rgba(212,175,55,0.22), rgba(212,175,55,0) 85%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
        className="whitespace-nowrap text-center font-display text-[15.5vw] font-extrabold leading-[0.85]"
      >
        SANGAMAM
      </motion.div>
    </div>
  );
}
