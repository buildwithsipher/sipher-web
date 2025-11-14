"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";

interface PulseDotsProps {
  isHovered?: boolean;
}

export default function PulseDots({ isHovered = false }: PulseDotsProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // Generate 4-8 randomized pulse positions
  const pulses = useMemo(() => {
    const count = 4 + Math.floor(Math.random() * 5); // 4-8 pulses
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      // Random positions within India's approximate bounds
      // X: 25-75% (avoiding extreme edges), Y: 25-85% (avoiding extreme top/bottom)
      x: 25 + Math.random() * 50,
      y: 25 + Math.random() * 60,
      // Random delay for staggered start (0-1s)
      delay: Math.random() * 1.0,
    }));
  }, []); // Only generate once on mount

  // Pulse speed: 1.0s normal, 0.8s when hovered
  const pulseDuration = isHovered ? 0.8 : 1.0;

  // Delay pulses until stroke is fully drawn (0.8s glow + 1.2s stroke + 0.4s = 2.4s)
  const pulseStartDelay = 2.4;

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none">
      {pulses.map((pulse) => (
        <div
          key={pulse.id}
          className="absolute"
          style={{
            left: `${pulse.x}%`,
            top: `${pulse.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Subtle Glow Aura */}
          <motion.div
            className="absolute w-16 h-16 rounded-full bg-purple-500/15 blur-2xl"
            animate={{
              opacity: inView ? [0.2, 0.4, 0.2] : 0,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: pulseDuration * 1.5,
              repeat: Infinity,
              delay: pulseStartDelay + pulse.delay,
              ease: "easeInOut",
            }}
          />

          {/* Expanding Wave Pulses (3 waves per pulse) */}
          {[0, 1, 2].map((waveIndex) => (
            <motion.div
              key={waveIndex}
              className="absolute rounded-full border border-purple-400/40"
              style={{
                width: "8px",
                height: "8px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                transformOrigin: "center center",
              }}
              initial={{ scale: 1, opacity: 0 }}
              animate={inView ? {
                scale: [1, 3.0],
                opacity: [0.6, 0],
              } : { scale: 1, opacity: 0 }}
              transition={{
                duration: pulseDuration,
                repeat: Infinity,
                delay: pulseStartDelay + pulse.delay + (waveIndex * (pulseDuration / 3)),
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

