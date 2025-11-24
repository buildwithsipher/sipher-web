'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'
import { useSharedInView } from './useSharedInView'

interface AmbientEnergyWavesProps {
  isHovered?: boolean
  isScrolling?: boolean
}

function AmbientEnergyWaves({ isHovered = false, isScrolling = false }: AmbientEnergyWavesProps) {
  const { inView } = useSharedInView() // Use shared observer

  // Wave speed increases slightly on hover
  const waveSpeed = isHovered ? 0.9 : 1.0

  // Generate multiple wave layers - REDUCED COUNT for better performance
  const waveLayers = [
    { x: 40, y: 50, delay: 0 },
    { x: 60, y: 55, delay: 2 },
    { x: 50, y: 70, delay: 4 },
    // Removed 1 wave layer to reduce simultaneous blur effects
  ]

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        contain: 'layout style paint', // Scroll containment
        transform: 'translate3d(0, 0, 0)', // GPU compositing
        willChange: 'opacity, transform', // Optimize for animations
      }}
    >
      {waveLayers.map((wave, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            left: `${wave.x}%`,
            top: `${wave.y}%`,
            transform: 'translate3d(-50%, -50%, 0)', // Better GPU acceleration
            width: '200px',
            height: '200px',
            // Replace blur with solid gradient during scroll - blur only when not scrolling
            background: isScrolling
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.06) 40%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 40%, transparent 70%)',
            filter: isScrolling ? 'none' : 'blur(16px)', // Only blur when not scrolling
            willChange: 'opacity, transform', // Keep constant to avoid layer rebuilds
            isolation: 'isolate', // Create stacking context
            display: isScrolling ? 'none' : 'block', // Hide completely during scroll
          }}
          animate={
            inView && !isScrolling
              ? {
                  scale: [1, 2.0, 2.5],
                  opacity: [0.2, 0.4, 0],
                }
              : { scale: 1.5, opacity: 0.2 }
          }
          transition={{
            duration: 4 * waveSpeed,
            delay: isScrolling ? 0 : 2.0 + wave.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      ))}
    </div>
  )
}

// Memoize to prevent re-renders
export default memo(AmbientEnergyWaves)
