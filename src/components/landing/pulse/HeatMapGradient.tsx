'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'
import { useSharedInView } from './useSharedInView'

interface HeatMapGradientProps {
  isHovered?: boolean
  isScrolling?: boolean
}

function HeatMapGradient({ isHovered = false, isScrolling = false }: HeatMapGradientProps) {
  const { inView } = useSharedInView() // Use shared observer

  // Heat map "hotspots" - REDUCED COUNT for better performance
  // These are subtle gradients that shift position over time
  const hotspots = [
    { x: 45, y: 60, size: 180, intensity: 0.4 }, // Mumbai/Delhi region
    { x: 50, y: 70, size: 160, intensity: 0.35 }, // Bangalore
    { x: 65, y: 28, size: 140, intensity: 0.3 }, // Delhi NCR
    // Removed 2 hotspots to reduce simultaneous blur effects
  ]

  // Intensity increases slightly on hover
  const intensity = isHovered ? 1.15 : 1.0

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        contain: 'layout style paint', // Scroll containment
        transform: 'translate3d(0, 0, 0)', // GPU compositing
        willChange: 'opacity', // Optimize for opacity changes
      }}
    >
      {hotspots.map((spot, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            transform: 'translate3d(-50%, -50%, 0)', // Better GPU acceleration
            width: `${spot.size}px`,
            height: `${spot.size}px`,
            // Replace blur with solid gradient during scroll - blur only when not scrolling
            background: isScrolling
              ? `radial-gradient(circle, rgba(139, 92, 246, ${spot.intensity * intensity * 0.08}) 0%, rgba(6, 182, 212, ${spot.intensity * intensity * 0.04}) 50%, transparent 70%)`
              : `radial-gradient(circle, rgba(139, 92, 246, ${spot.intensity * intensity * 0.06}) 0%, rgba(6, 182, 212, ${spot.intensity * intensity * 0.03}) 50%, transparent 70%)`,
            filter: isScrolling ? 'none' : 'blur(24px)', // Only blur when not scrolling
            willChange: 'opacity', // Keep constant to avoid layer rebuilds
            isolation: 'isolate', // Create stacking context
            display: isScrolling ? 'none' : 'block', // Hide completely during scroll
          }}
          animate={
            inView && !isScrolling
              ? {
                  opacity: [0.2, 0.4, 0.2],
                }
              : { opacity: 0.2 }
          }
          transition={{
            duration: 8 + index * 1,
            delay: isScrolling ? 0 : 2.0 + index * 1,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
          }}
        />
      ))}
    </div>
  )
}

// Memoize to prevent re-renders
export default memo(HeatMapGradient)
