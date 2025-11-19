'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  distance: number
}

interface ParticleBurstProps {
  trigger: boolean
  count?: number
  colors?: string[]
  onComplete?: () => void
}

export function ParticleBurst({
  trigger,
  count = 12,
  colors = ['#7B5CFF', '#4AA8FF', '#6FDDFF', '#10B981'],
  onComplete,
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!trigger) return

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50, // Center X percentage
      y: 50, // Center Y percentage
      angle: (360 / count) * i,
      distance: 50 + Math.random() * 30,
    }))

    setParticles(newParticles)

    // Cleanup after animation
    const timer = setTimeout(() => {
      setParticles([])
      onComplete?.()
    }, 1600)

    return () => clearTimeout(timer)
  }, [trigger, count, onComplete])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180
        const endX = particle.x + Math.cos(radians) * particle.distance
        const endY = particle.y + Math.sin(radians) * particle.distance
        const color = colors[Math.floor(Math.random() * colors.length)]

        return (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: color,
            }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              x: `${(endX - particle.x) * 2}%`,
              y: `${(endY - particle.y) * 2}%`,
            }}
            transition={{
              duration: 1.6,
              ease: 'easeOut',
            }}
          />
        )
      })}
    </div>
  )
}

