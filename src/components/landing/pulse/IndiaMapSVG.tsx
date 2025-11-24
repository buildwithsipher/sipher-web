'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import { INDIA_PATH } from './india-path-constant'
import { useSharedInView } from './useSharedInView'

interface IndiaMapSVGProps {
  isHovered?: boolean
  isScrolling?: boolean
}

export default function IndiaMapSVG({ isHovered = false, isScrolling = false }: IndiaMapSVGProps) {
  const { inView, ref: sharedRef } = useSharedInView()
  const ref = useRef<HTMLDivElement>(null)
  // Use shared ref if available, fallback to local ref
  const activeRef = (sharedRef as React.RefObject<HTMLDivElement>) || ref

  // Phase 1: Ambient glow reveal (0.3s → 0.8s fade in)
  // Phase 2: Map outline stroke-draw (0.8s - fast, smooth, attractive)
  // Phase 3: Pulse field activation (0.4s delay after stroke = 1.3s total)
  // Phase 4: Soft breathing glow (infinite 3s loop)

  // Cursor hover effects: +20% glow intensity, subtle outline glow
  const glowIntensity = isHovered ? 1.2 : 1.0
  const outlineGlow = isHovered
    ? 'drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]'
    : 'drop-shadow-[0_0_20px_rgba(180,120,255,0.3)]'

  return (
    <div
      ref={activeRef}
      className="relative w-full mx-auto"
      style={{
        contain: 'layout style paint', // Scroll containment
        transform: 'translate3d(0, 0, 0)', // GPU compositing layer
        backfaceVisibility: 'hidden', // Optimize transforms
      }}
    >
      {/* Phase 1: Ambient glow reveal (fade in, not pop) */}
      {/* Removed blur entirely - use solid gradient with CSS variable for performance */}
      <motion.div
        className="absolute inset-0"
        style={{
          // Replace blur with solid gradient during scroll for better performance
          background: isScrolling
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.06) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 40%, transparent 70%)',
          filter: isScrolling ? 'none' : 'blur(40px)', // Only blur when not scrolling
          contain: 'layout style paint', // Scroll containment
          transform: 'translate3d(0, 0, 0)', // GPU compositing
          willChange: 'opacity', // Keep constant to avoid layer rebuilds
          display: isScrolling ? 'none' : 'block', // Hide during scroll for maximum performance
        }}
        animate={{
          opacity: inView ? 0.6 * glowIntensity * (isScrolling ? 0.7 : 1) : 0,
        }}
        transition={{
          duration: isScrolling ? 0 : 0.8,
          delay: isScrolling ? 0 : 0.3,
          ease: 'easeOut',
        }}
      />

      {/* Dotted Grid Layer (fade in with glow) */}
      <motion.svg
        viewBox="0 0 1000 1200"
        className="absolute inset-0 w-full h-full"
        fill="none"
        style={{
          contain: 'layout style paint', // Scroll containment
          transform: 'translate3d(0, 0, 0)', // GPU compositing
          willChange: 'opacity', // Keep constant
          display: isScrolling ? 'none' : 'block', // Hide during scroll
        }}
        animate={{
          opacity: inView ? 0.18 : 0,
        }}
        transition={{
          duration: 0.8,
          delay: 0.3,
          ease: 'easeOut',
        }}
      >
        {Array.from({ length: 220 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 37) % 1000}
            cy={((i * 37) / 1000) * 1200}
            r="3"
            className="fill-white/10"
          />
        ))}
      </motion.svg>

      {/* Phase 2: India Outline - Stroke Draw (fast, smooth, attractive) */}
      <svg
        viewBox="0 0 1000 1200"
        className={`w-full h-auto mx-auto ${outlineGlow} opacity-95 transition-all duration-300`}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          {/* Gradient for inner glow fill */}
          <linearGradient id="noirGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
          </linearGradient>

          {/* Gradient stroke - purple to cyan for visual interest */}
          <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="1" /> {/* purple-500 */}
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" /> {/* purple-600 */}
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" /> {/* cyan-500 */}
          </linearGradient>

          {/* Glow filter for trailing effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Glow Stroke - Draws first, creates depth */}
        <motion.path
          d={INDIA_PATH}
          stroke="rgba(168, 85, 247, 0.6)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={isScrolling ? undefined : 'url(#glow)'} // Disable glow filter during scroll
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          animate={{
            pathLength: inView && !isScrolling ? 1 : inView ? 1 : 0, // Pause animation during scroll
            opacity: inView && !isScrolling ? 1 : inView ? 0.8 : 0,
          }}
          transition={{
            duration: 0.8,
            delay: isScrolling ? 0 : 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* Main Gradient Stroke - Fast, smooth, attractive */}
        <motion.path
          d={INDIA_PATH}
          stroke="url(#strokeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          animate={{
            pathLength: inView && !isScrolling ? 1 : inView ? 1 : 0, // Pause animation during scroll
            opacity: inView && !isScrolling ? 1 : inView ? 0.9 : 0,
          }}
          transition={{
            duration: 0.8,
            delay: isScrolling ? 0 : 0.55,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* Inner Crisp Stroke - White for definition */}
        <motion.path
          d={INDIA_PATH}
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          animate={{
            pathLength: inView && !isScrolling ? 1 : inView ? 1 : 0, // Pause animation during scroll
            opacity: inView && !isScrolling ? 0.9 : inView ? 0.8 : 0,
          }}
          transition={{
            duration: 0.8,
            delay: isScrolling ? 0 : 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* Inner Glow Fill (fade in after stroke completes) */}
        <motion.path
          d={INDIA_PATH}
          fill="url(#noirGlow)"
          initial={{ opacity: 0 }}
          animate={{
            opacity: inView ? 0.3 : 0,
          }}
          transition={{
            duration: 0.6,
            delay: 1.3, // After stroke completes (0.5 + 0.8)
            ease: 'easeOut',
          }}
        />
      </svg>

      {/* Phase 4: Soft Breathing Glow (hidden during scroll for maximum performance) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          // Replace blur with solid gradient during scroll
          background:
            'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 50%, transparent 70%)',
          filter: isScrolling ? 'none' : 'blur(24px)', // Only blur when not scrolling
          willChange: 'opacity', // Keep constant to avoid layer rebuilds
          transform: 'translate3d(0, 0, 0)', // GPU acceleration
          isolation: 'isolate', // Create stacking context
          display: isScrolling ? 'none' : 'block', // Hide completely during scroll
        }}
        animate={
          !isScrolling && inView
            ? {
                opacity: [0.2, 0.35, 0.2],
              }
            : { opacity: 0.25 }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          delay: isScrolling ? 0 : 1.3,
          ease: [0.4, 0, 0.6, 1],
        }}
      />
    </div>
  )
}
