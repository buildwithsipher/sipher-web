"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative w-full py-16 md:py-32"
      style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 50%), #0b0b0c'
      }}
    >
      <div className="max-w-[750px] mx-auto px-4 sm:px-6">
        {/* Headline Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-6 md:mb-8">
            You build. You ship. But your <span className="text-purple-400">execution</span> stays invisible.
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-white/70 leading-relaxed">
            Your daily work lives in scattered places — product updates, customer conversations, sales activities, content you create. 
            Investors can't see it. Your network doesn't know about it. Opportunities pass you by.
          </p>
        </motion.div>

        {/* Core Problem Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="border-l-2 border-purple-500/40 pl-4 md:pl-6 py-4 bg-purple-500/5 rounded-r-lg">
            <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-4">
              This isn't a talent problem. It's a <span className="text-purple-400 font-semibold">visibility</span> problem.
            </p>
            <p className="text-sm md:text-base lg:text-lg text-white/70 leading-relaxed">
              You're executing. The world just can't see it.
          </p>
          </div>
        </motion.div>

        {/* Real Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="space-y-4 md:space-y-6"
        >
          <p className="text-base md:text-lg text-white/80 leading-relaxed">
            Cold outreach goes unanswered because there's no proof of your momentum. 
            Investors default to <span className="text-purple-400/80">pedigree</span> because execution is invisible. 
            Your network doesn't know what you're building.
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed">
            You need a way to make your daily <span className="text-purple-400/80">execution</span> visible — not your credentials, 
            not your network, but your actual work.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

