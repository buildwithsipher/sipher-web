"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const visibilityLoop = [
  "You ship",
  "but no one sees",
  "so no one trusts",
  "so no one responds",
  "so opportunities die",
  "so you ship again",
  "and still no one sees",
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative w-full bg-[#0b0b0c] py-32"
    >
      <div className="max-w-[750px] mx-auto px-4 sm:px-6">
        {/* Headline Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
            Founders like you struggle with one thing:
            <br />
            <span className="text-white/70">not execution — visibility.</span>
          </h2>
        </motion.div>

        {/* Intro Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-16"
        >
          <p className="text-lg text-white/70 leading-relaxed">
            You build. You ship. You move fast.
            <br />
            But the world can't see it.
          </p>
        </motion.div>

        {/* Visibility Loop */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="mb-16 space-y-4"
        >
          {visibilityLoop.map((line, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-2xl md:text-3xl font-medium text-white/80"
            >
              {line}
            </motion.div>
          ))}

          {/* Final Line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              isInView
                ? {
                    opacity: [0.6, 0.8, 0.6],
                    y: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.8,
              delay: 0.8,
              opacity: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="text-2xl md:text-3xl font-medium text-white/90 mt-8"
          >
            Execution isn't the issue. Visibility is.
          </motion.div>
        </motion.div>

        {/* Closing Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <p className="text-lg text-white/70 leading-relaxed">
            Your work has no home.
            <br />
            Your proof has no identity.
            <br />
            Your momentum has no signal.
          </p>
          <p className="text-lg text-white/70 leading-relaxed mt-6">
            This isn't a talent problem.
            <br />
            It's a visibility problem.
          </p>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-white/50">
            247+ founders have already recognized this problem
          </p>
        </motion.div>
      </div>
    </section>
  );
}

