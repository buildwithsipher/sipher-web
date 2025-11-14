"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STRUGGLES = [
  "invisible execution",
  "slow trust-building",
  "cold outreach that goes nowhere",
  "VC responses that never arrive",
  "proof scattered across 10 tools",
  "building without a network",
  "unclear compliance and legal steps",
  "the pressure to prove credibility every day",
];

export default function FounderMirrorSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const rafIdRef = useRef<number | null>(null);

  // Throttled mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current) return;

    // Cancel previous animation frame
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;

      // Divide viewport into 8 equal zones
      const zoneWidth = 100 / 8;
      let zoneIndex = Math.floor(percentage / zoneWidth);
      
      // Clamp to valid range
      zoneIndex = Math.max(0, Math.min(7, zoneIndex));

      setActivePhraseIndex(zoneIndex);
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.addEventListener("mousemove", handleMouseMove);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleMouseMove]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0b0b0c] py-20 md:py-32 px-4 sm:px-6"
    >
      <div className="max-w-[780px] mx-auto text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-semibold text-white/90 mb-4 md:mb-6 leading-tight"
        >
          Founders like you struggle with…
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-sm md:text-base text-white/50 mb-8 md:mb-12"
        >
          Move your cursor to explore
        </motion.p>

        {/* Dynamic Phrase Container */}
        <div className="relative h-[4rem] md:h-[5rem] flex items-center justify-center mb-8 md:mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1], // Custom easing for premium feel
              }}
              className="text-3xl md:text-4xl font-medium text-white"
            >
              {STRUGGLES[activePhraseIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Static Line */}
        <p className="text-base md:text-lg text-white/60 leading-relaxed">
          You're not alone. Every builder feels this before they're seen.
        </p>
      </div>
    </section>
  );
}

