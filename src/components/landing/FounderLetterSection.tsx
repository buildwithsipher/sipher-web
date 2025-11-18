"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const LETTER_PARAGRAPHS = [
  "For the past six months, I've been speaking to founders across India.",
  "Some were students.\nSome were in MNC jobs.\nSome were second-time entrepreneurs.\nSome were profitable and invisible.\nSome were building from hostels, bedrooms, café corners.\nSome were carrying startups on their backs with no recognition.",
  "Every founder had a different story,\nbut their struggles kept falling into the same four buckets:",
  "• Invisibility — no one sees your execution\n• Isolation — building alone with no signal\n• Uncertainty — compliance, legal, operational risk\n• Access — intros, due diligence, conversations that go nowhere",
  "One founder in Hyderabad told me he lost a ₹50 lakh funding deal\nbecause of a simple MCA filing mistake.\nMonths of work — gone overnight.",
  "Another founder shipped daily for six months and said:\n\"On LinkedIn, I still look unemployed.\"",
  "And countless founders in MNCs wake up every day thinking:\n\"Should I quit and build, or stay safe and regret it later?\"",
  "They're not lacking skill.\nThey're not lacking drive.\nThey're not lacking ideas.",
  "They're lacking visibility.\nThey're lacking proof.\nThey're lacking a place where their work has weight.",
  "I come from a business family.\nI started managing parts of our operations when I was 18.\nLater, I became an AIML developer.\nI've lived both worlds:\ntraditional business and modern startup chaos.",
  "And along the way, I realized something simple:\nFounders don't fail because they lack effort.\nThey fail because their effort has no surface area.",
  "No visibility.\nNo timeline.\nNo signal.\nNo way to show the intensity behind their execution.",
  "That's why I built Sipher.",
  "Not as a community.\nNot as a social feed.\nNot as another place to talk.",
  "But as a place where execution becomes identity.\nWhere momentum is seen.\nWhere daily work becomes undeniable proof.\nWhere founders who ship — not pitch — get discovered.",
  "Sipher exists to make execution louder than pedigree.",
  "If you build every day,\nyou deserve to be seen every day.",
  "Welcome to Day Zero.\nLet's rewrite how Indian founders get discovered.",
];

export default function FounderLetterSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 md:py-32 px-4 sm:px-6 relative"
      style={{
        background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%), #0B0B0C'
      }}
    >
      <div className="max-w-3xl mx-auto relative">
        {/* Left-side pulse line - Apple-style subtle */}
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
          className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/20 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.15)] hidden md:block"
        />

        {/* Content */}
        <div className="pl-0 md:pl-12">
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              Why I Built Sipher
              <br />
              <span className="text-white/70">— A Letter to Builders</span>
            </h2>
            <p className="text-sm md:text-base text-white/50 mt-4">
              by Srideep Goud
            </p>
          </motion.div>

          {/* Letter Body */}
          <div className="space-y-6 md:space-y-8 mt-12 md:mt-16">
            {LETTER_PARAGRAPHS.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.3 + index * 0.1,
                  ease: "easeOut",
                }}
                className="text-base md:text-lg lg:text-xl text-white/70 leading-relaxed whitespace-pre-line"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 2.0, ease: "easeOut" }}
            className="text-center mt-16 md:mt-20"
          >
            <div className="text-xl md:text-2xl text-white/90 font-semibold leading-relaxed relative inline-block mb-8">
              Welcome to Day Zero.
              {/* Soft neon underline */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={
                  isInView && !reduced
                    ? {
                        width: "100%",
                        opacity: 0.2,
                      }
                    : { width: "100%", opacity: 0.2 }
                }
                transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }}
                className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-purple-400/20 via-cyan-300/20 to-purple-400/20 rounded-full"
              />
            </div>

            {/* CTA - Join the Movement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 2.4 }}
              className="flex flex-col items-center gap-4"
            >
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openWaitlist'));
                }}
                className="px-6 py-3 border border-white/20 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:border-white/40 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Join the movement by joining the waitlist"
              >
                Join the Movement →
              </button>
              <p className="text-xs text-white/40">
                247+ founders building where execution becomes identity
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

