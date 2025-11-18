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
      className="relative w-full py-20 md:py-32 px-4 sm:px-6"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%), #0b0b0c'
      }}
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
          className="text-sm md:text-base text-white/60 mb-8 md:mb-12"
        >
          Move your cursor to explore
        </motion.p>

        {/* Dynamic Phrase Container */}
        <div className="relative h-[5rem] md:h-[6rem] flex items-center justify-center mb-8 md:mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="relative text-center px-4"
            >
              <span className="text-4xl md:text-5xl font-semibold text-purple-400 relative inline-block tracking-tight leading-tight">
                {STRUGGLES[activePhraseIndex]}
                {/* Elegant underline accent */}
                <motion.div
                  className="absolute -bottom-3 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                />
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Static Line */}
        <p className="text-base md:text-lg text-white/70 leading-relaxed">
          You're not alone. Every builder feels this before they're seen.
        </p>
      </div>
    </section>
  );
}

