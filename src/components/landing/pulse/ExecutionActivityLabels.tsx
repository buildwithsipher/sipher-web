"use client";

import { motion } from "framer-motion";
import { useMemo, memo } from "react";
import { useSharedInView } from "./useSharedInView";

interface ExecutionActivityLabelsProps {
  isHovered?: boolean;
  isScrolling?: boolean;
}

// Execution-related activity labels that appear and fade
const executionLabels = [
  "47 features shipped",
  "ProofCard: 87",
  "12 commits today",
  "3 customers onboarded",
  "ProofCard: 92",
  "28 features this month",
  "15 commits pushed",
  "ProofCard: 81",
  "8 new users",
  "ProofCard: 79",
  "22 commits today",
  "5 features shipped",
  "ProofCard: 85",
  "12 customers closed",
  "34 commits pushed",
];

function ExecutionActivityLabels({ isHovered = false, isScrolling = false }: ExecutionActivityLabelsProps) {
  const { inView } = useSharedInView(); // Use shared observer

  // Generate random positions and timing for labels - REDUCED COUNT for performance
  const labelData = useMemo(() => {
    const count = 4 + Math.floor(Math.random() * 2); // 4-5 labels (reduced from 6-9)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      text: executionLabels[Math.floor(Math.random() * executionLabels.length)],
      x: 25 + Math.random() * 50, // 25-75% (tighter bounds to avoid edges)
      y: 30 + Math.random() * 45, // 30-75% (tighter bounds)
      delay: 2.5 + i * 0.4 + Math.random() * 0.5, // Staggered start (not all at once)
      duration: 4 + Math.random() * 1.0, // 4-5s (slightly longer, smoother)
      initialDelay: i * 0.3, // Better stagger
    }));
  }, []);

  // Speed up slightly on hover
  const floatSpeed = isHovered ? 0.85 : 1.0;

  // Conditional rendering - don't render labels during scroll
  if (isScrolling) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        contain: 'layout style paint', // Scroll containment
        transform: 'translate3d(0, 0, 0)', // GPU compositing
        willChange: 'transform, opacity', // Keep constant
      }}
    >
      {labelData.map((label) => (
        <motion.div
          key={label.id}
          className="absolute"
          style={{
            left: `${label.x}%`,
            top: `${label.y}%`,
            transform: "translate3d(-50%, -50%, 0)", // Better GPU acceleration
          }}
          initial={{ opacity: 0, y: 0, scale: 0.85 }}
          animate={inView ? {
            opacity: 0.9,
            y: -35,
            scale: 1,
          } : { 
            opacity: 0,
            y: 0, 
            scale: 0.85 
          }}
          transition={{
            opacity: {
              duration: 0.4,
              delay: label.delay + label.initialDelay,
              ease: [0.4, 0, 0.2, 1],
            },
            y: {
              duration: label.duration * floatSpeed * 0.9,
              delay: label.delay + label.initialDelay,
              ease: [0.4, 0, 0.2, 1],
              repeat: Infinity,
              repeatDelay: 3 + Math.random() * 2,
            },
            scale: {
              duration: 0.3,
              delay: label.delay + label.initialDelay,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            transition: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
        >
          <div 
            className="px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 text-xs md:text-sm font-medium text-purple-300 whitespace-nowrap"
            style={{
              // Removed backdrop-filter entirely - too expensive
              willChange: 'transform, opacity',
              transform: 'translate3d(0, 0, 0)', // GPU layer creation
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.25)', // Simpler shadow
            }}
          >
            {label.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Memoize to prevent re-renders when isHovered changes (parent re-renders)
export default memo(ExecutionActivityLabels);

