"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface CSEIntroSequenceProps {
  onComplete: () => void;
}

// Exactly 12 unique photos from PHOTOS folder, each appearing once
const INTRO_PHOTOS = [
  "/intro-photos/photo-5.png",   // 1. Machine Cycle
  "/intro-photos/photo-2.png",   // 2. Vintage Computer (hi)
  "/intro-photos/photo-12.png",  // 3. Chess Pieces (16662.png)
  "/intro-photos/photo-8.png",   // 4. n! >>> n Complexity Graph
  "/intro-photos/photo-3.png",   // 5. 2^8 = 256 Binary
  "/intro-photos/photo-10.png",  // 6. What the heck Error Box
  "/intro-photos/photo-6.png",   // 7. Binary Search Tree
  "/intro-photos/photo-4.png",   // 8. Windows / Linux / macOS
  "/intro-photos/photo-1.webp",  // 9. Dopamine Molecule
  "/intro-photos/photo-9.png",   // 10. 200 OK / 4xx Error
  "/intro-photos/photo-7.png",   // 11. Call Stack LIFO
  "/intro-photos/photo-11.png",  // 12. Command Line Interface (figlet)
];

export default function CSEIntroSequence({ onComplete }: CSEIntroSequenceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const vignetteRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [readyToAnimate, setReadyToAnimate] = useState(false);

  // Preload photos in the background for zero-latency, buttery-smooth playback
  useEffect(() => {
    let active = true;
    let loaded = 0;
    const required = Math.min(4, INTRO_PHOTOS.length);

    INTRO_PHOTOS.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        if (!active) return;
        loaded++;
        if (loaded >= required) {
          setReadyToAnimate(true);
        }
      };
    });

    const fallbackTimer = setTimeout(() => {
      if (active) setReadyToAnimate(true);
    }, 300);

    return () => {
      active = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // GSAP flipbook animation timeline matching IIIT Hyderabad Infinium pacing & structure
  useEffect(() => {
    if (!readyToAnimate || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
      });

      // Rhythmic flipbook frame punch duration for 12 photos
      const FRAME_STEP = 0.15;

      // Frame stacking sequence
      INTRO_PHOTOS.forEach((_, idx) => {
        const wrapper = wrapperRefs.current[idx];
        const img = imgRefs.current[idx];
        if (!wrapper || !img) return;

        // Stamp frame wrapper on top of previous layers
        tl.to(
          wrapper,
          {
            autoAlpha: 1,
            duration: 0.01,
          },
          idx * FRAME_STEP
        );

        // Infinium scale punch impact (1.10 -> 1.0) with transformOrigin on upper-mid
        tl.fromTo(
          img,
          { scale: 1.1, transformOrigin: "center 42%" },
          {
            scale: 1.0,
            transformOrigin: "center 42%",
            duration: 0.22,
            ease: "power2.out",
          },
          idx * FRAME_STEP
        );
      });

      const revealTime = INTRO_PHOTOS.length * FRAME_STEP + 0.04;

      // Dark radial vignette fades in
      if (vignetteRef.current) {
        tl.to(
          vignetteRef.current,
          {
            autoAlpha: 1,
            duration: 0.35,
            ease: "power2.out",
          },
          revealTime
        );
      }

      // Title wipe reveal (clip-path horizontal wipe: 0% 100% -> 0% 0%)
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          {
            clipPath: "inset(0% 100% 0% 0%)",
            autoAlpha: 1,
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.48,
            ease: "power3.inOut",
          },
          revealTime + 0.06
        );
      }

      // Subtitle & fest badge fade in
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          {
            y: 18,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.35,
            ease: "power2.out",
          },
          revealTime + 0.3
        );
      }

      // Brief dramatic pause
      tl.to({}, { duration: 0.75 });

      // Clean fade out of full overlay, revealing main website
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          onComplete();
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [readyToAnimate, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[999999] h-[100dvh] w-full overflow-hidden bg-black select-none pointer-events-auto"
    >
      {/* Photo Frame Stack (Infinium .frame-wrapper architecture) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {INTRO_PHOTOS.map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            ref={(el) => {
              wrapperRefs.current[idx] = el;
            }}
            className="frame-wrapper absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={{
              zIndex: 10 + idx,
              visibility: "hidden",
              opacity: 0,
            }}
          >
            {/* Lift image position upwards so subjects are framed in optical center */}
            <div className="w-full h-full flex items-center justify-center -translate-y-[8.5%] sm:-translate-y-[9%]">
              <img
                ref={(el) => {
                  imgRefs.current[idx] = el;
                }}
                src={src}
                alt=""
                className="animation-frame w-full h-full object-cover select-none pointer-events-none will-change-transform"
                style={{
                  transformOrigin: "center 42%",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Solid Black Backdrop to prevent any blending with previous photo */}
      <div
        ref={vignetteRef}
        className="absolute inset-0 pointer-events-none bg-black"
        style={{
          zIndex: 80,
          visibility: "hidden",
          opacity: 0,
        }}
      />

      {/* Central Title Reveal - Pure White, Only SANGAMAM (No MVSR, No Blending) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center"
        style={{ zIndex: 90 }}
      >
        <div
          ref={titleRef}
          style={{ visibility: "hidden", opacity: 0 }}
          className="will-change-transform"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]">
            SANGAMAM
          </h1>
          <div className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.3em] text-white uppercase font-mono">
            2026
          </div>
        </div>

        <div
          ref={subtitleRef}
          style={{ visibility: "hidden", opacity: 0 }}
          className="mt-6 flex flex-col items-center gap-3"
        >
          <div className="h-0.5 w-24 bg-white/70 my-1" />
          <p className="font-mono text-xs sm:text-sm tracking-[0.3em] text-white uppercase font-bold">
            ANNUAL TECHNICAL FESTIVAL
          </p>
        </div>
      </div>
    </div>
  );
}
