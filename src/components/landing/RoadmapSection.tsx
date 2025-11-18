"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const REALITY_SCAN_LINES = [
  "12:1 talk-to-build ratio in most founder groups",
  "Endless opinions → zero signal",
  "Dozens of resources → no path",
  "Thousands of communities → no velocity",
  "Hard work → invisible",
  "Execution → unmeasured",
  "Opportunity → delayed",
];

const PHASE_1_ITEMS = [
  "Proof — Make execution visible",
  "Scores — Quantify movement, not pedigree",
  "Discovery — Opportunity based on action",
];

const PHASE_2_ITEMS = [
  "Clarity Tools",
  "Direction Systems",
  "Execution Frameworks",
  "Founder Velocity Loops",
];

const PHASE_3_ITEMS = [
  "Opportunity Graphs",
  "Signals, not social feeds",
  "Collaborative execution spaces",
  "Proof-first introductions",
];

export default function RoadmapSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });
  const [hoveredFooter, setHoveredFooter] = useState(false);

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 md:py-32 px-4 sm:px-6 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.03) 0%, transparent 50%), #0B0B0C'
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* (1) Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20 md:mb-28"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
            The Road Ahead
          </h2>
          <p className="text-xl md:text-2xl text-[#8B8B8B] max-w-3xl mx-auto mb-12 leading-relaxed">
            Sipher isn't a tool.
            <br />
            It's the beginning of a new way founders build.
          </p>

          {/* Animated Pulse Line - Apple-style subtle */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={
              isInView && !reduced
                ? { width: "100%", opacity: 1 }
                : { width: "100%", opacity: 1 }
            }
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            className="mx-auto max-w-2xl relative"
          >
            <motion.div
              initial={{ opacity: 0.15 }}
              animate={
                isInView && !reduced
                  ? { opacity: [0.15, 0.35, 0.15] }
                  : { opacity: 0.15 }
              }
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-[1px] w-full bg-white/40 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.15)]"
            />
          </motion.div>
        </motion.div>

        {/* (2) The Truth We Learned */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mb-20 md:mb-28 max-w-4xl mx-auto"
        >
          <h3 className="text-3xl md:text-4xl font-black text-white mb-8 leading-tight">
            What We Learned From 1 Year of Studying Indian Founders
          </h3>
          <div className="space-y-6 text-lg md:text-xl text-[#8B8B8B] leading-relaxed">
            <p>
              Founders don't fail from lack of effort — they fail from lack of visibility, direction, and signal.
            </p>
            <p className="pt-4">
              We saw four repeating patterns:
            </p>
            <ul className="space-y-3 pl-6 list-disc list-outside">
              <li>Too much noise — not enough clarity</li>
              <li>Too many opinions — not enough proof</li>
              <li>Too many resources — not enough direction</li>
              <li>Too many communities — not enough movement</li>
            </ul>
            <p className="pt-6 text-xl md:text-2xl text-white/90 font-semibold">
              And the biggest truth:
            </p>
            <p className="text-2xl md:text-3xl text-white font-bold">
              No place where execution becomes credibility.
            </p>
          </div>
        </motion.div>

        {/* (3) Founder Reality Scan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20 md:mb-28 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl md:text-3xl font-black text-white mb-12 text-center">
            Founder Reality Scan
          </h3>
          <div className="space-y-6">
            {REALITY_SCAN_LINES.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        y: 0,
                        x: 0,
                      }
                    : {}
                }
                transition={{
                  duration: 0.6,
                  delay: 0.8 + index * 0.15,
                  ease: "easeOut",
                }}
                className="relative group"
              >
                <div className="flex items-center gap-4">
                  {/* Scanning line indicator - Apple-style subtle */}
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={
                      isInView && !reduced
                        ? {
                            width: "1px",
                            opacity: [0, 0.4, 0],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.6,
                      delay: 0.8 + index * 0.15,
                      repeat: 1,
                      ease: "easeInOut",
                    }}
                    className="h-6 bg-white/40 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                  />
                  <p className="text-lg md:text-xl text-[#8B8B8B] flex-1">
                    {line}
                  </p>
                </div>
                {/* Micro underline flicker - Apple-style subtle */}
                {isInView && !reduced && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                      width: "100%",
                      opacity: [0, 0.25, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.8 + index * 0.15 + 0.3,
                      ease: "easeOut",
                    }}
                    className="absolute bottom-0 left-0 h-[1px] bg-white/30 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* (4) Three-Phase Roadmap */}
        <div className="mb-20 md:mb-28 max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Spine - Apple-style subtle pulse */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={
                isInView && !reduced
                  ? {
                      height: "100%",
                      opacity: 1,
                    }
                  : { height: "100%", opacity: 1 }
              }
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              className="absolute left-8 md:left-12 top-0 bottom-0 w-[1px] bg-white/20 rounded-full"
              style={{
                boxShadow: "0 0 4px rgba(255, 255, 255, 0.15)",
              }}
            >
              {/* Constant slow pulse animation - subtle matte white */}
              {isInView && !reduced && (
                <motion.div
                  animate={{
                    opacity: [0.2, 0.35, 0.2],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-white/40 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                />
              )}
            </motion.div>

            <div className="relative pl-20 md:pl-32 space-y-24 md:space-y-32">
              {/* Phase 1 */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Timeline Node - Apple-style subtle */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                  className="absolute -left-12 md:-left-16 top-2 w-6 h-6 rounded-full bg-white/30 border-2 border-[#0B0B0C] flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 4px rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <motion.div
                    animate={
                      isInView && !reduced
                        ? {
                            opacity: [0.4, 0.8, 0.4],
                          }
                        : { opacity: 0.4 }
                    }
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full bg-white/60"
                  />
                </motion.div>

                <div>
                  <h4 className="text-3xl md:text-4xl font-black text-white mb-3">
                    Phase 1 — Foundation
                  </h4>
                  <p className="text-lg md:text-xl text-[#8B8B8B] mb-8 leading-relaxed">
                    What you see today is Day Zero.
                  </p>
                  <ul className="space-y-4">
                    {PHASE_1_ITEMS.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                        className="text-lg text-[#8B8B8B] leading-relaxed"
                      >
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Phase 2 */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="relative"
              >
                {/* Timeline Node - Apple-style subtle */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
                  className="absolute -left-12 md:-left-16 top-2 w-6 h-6 rounded-full bg-white/30 border-2 border-[#0B0B0C] flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 4px rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <motion.div
                    animate={
                      isInView && !reduced
                        ? {
                            opacity: [0.4, 0.8, 0.4],
                          }
                        : { opacity: 0.4 }
                    }
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full bg-white/60"
                  />
                </motion.div>

                <div>
                  <h4 className="text-3xl md:text-4xl font-black text-white mb-3">
                    Phase 2 — Momentum Layer
                  </h4>
                  <p className="text-lg md:text-xl text-[#8B8B8B] mb-8 leading-relaxed">
                    Tools that reduce noise, increase speed, and sharpen execution.
                  </p>
                  <ul className="space-y-4">
                    {PHASE_2_ITEMS.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                        className="text-lg text-[#8B8B8B] leading-relaxed"
                      >
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Phase 3 */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
                className="relative"
              >
                {/* Timeline Node - Apple-style subtle */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
                  className="absolute -left-12 md:-left-16 top-2 w-6 h-6 rounded-full bg-white/30 border-2 border-[#0B0B0C] flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 4px rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <motion.div
                    animate={
                      isInView && !reduced
                        ? {
                            opacity: [0.4, 0.8, 0.4],
                          }
                        : { opacity: 0.4 }
                    }
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full bg-white/60"
                  />
                </motion.div>

                <div>
                  <h4 className="text-3xl md:text-4xl font-black text-white mb-3">
                    Phase 3 — Network Layer
                  </h4>
                  <p className="text-lg md:text-xl text-[#8B8B8B] mb-8 leading-relaxed">
                    A new kind of founder network — built around action, not noise.
                  </p>
                  <ul className="space-y-4">
                    {PHASE_3_ITEMS.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                        className="text-lg text-[#8B8B8B] leading-relaxed"
                      >
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* (5) Footer Promise */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
          onMouseEnter={() => setHoveredFooter(true)}
          onMouseLeave={() => setHoveredFooter(false)}
        >
          <p className="text-2xl md:text-3xl lg:text-4xl text-white leading-relaxed mb-4">
            We reveal things only when they're ready.
          </p>
          <p className="text-xl md:text-2xl text-[#8B8B8B] mb-6 leading-relaxed">
            No hype. No noise. Just momentum.
          </p>
          <p className="text-xl md:text-2xl text-white/90 font-semibold leading-relaxed relative inline-block mb-8">
            Early founders shape what comes next.
            {/* Shimmering underline on hover - Apple-style subtle */}
            {hoveredFooter && !reduced && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: "100%",
                  opacity: [0.15, 0.35, 0.15],
                }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-0 left-0 h-[1px] bg-white/40 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.15)]"
              />
            )}
          </p>

          {/* CTA - Join for Early Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openWaitlist'));
              }}
              className="px-6 py-3 border border-white/20 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:border-white/40 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Join waitlist for early access"
            >
              Join for Early Access →
            </button>
            <p className="text-xs text-white/40">
              Be among the first to shape Sipher's future
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

