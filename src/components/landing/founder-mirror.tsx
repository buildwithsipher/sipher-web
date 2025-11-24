'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STRUGGLES = [
  'execution visibility',
  'cold outreach',
  'slow trust-building',
  'lack of proof',
  'noisy communities',
  'delayed opportunities',
  'pedigree bias',
  'scattered logs',
]

export function FounderMirrorSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeWordIndex, setActiveWordIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let rafId: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      if (!section) return

      // Cancel previous animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = (x / rect.width) * 100

        // Determine which zone the cursor is in (8 zones with specific ranges)
        let zoneIndex = 0
        if (percentage < 12)
          zoneIndex = 0 // execution visibility
        else if (percentage < 24)
          zoneIndex = 1 // cold outreach
        else if (percentage < 36)
          zoneIndex = 2 // slow trust-building
        else if (percentage < 48)
          zoneIndex = 3 // lack of proof
        else if (percentage < 60)
          zoneIndex = 4 // noisy communities
        else if (percentage < 72)
          zoneIndex = 5 // delayed opportunities
        else if (percentage < 84)
          zoneIndex = 6 // pedigree bias
        else zoneIndex = 7 // scattered logs

        setActiveWordIndex(zoneIndex)
      })
    }

    const handleMouseEnter = () => {
      setIsHovering(true)
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
      // Keep the last selected word when cursor leaves
    }

    section.addEventListener('mousemove', handleMouseMove)
    section.addEventListener('mouseenter', handleMouseEnter)
    section.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      section.removeEventListener('mousemove', handleMouseMove)
      section.removeEventListener('mouseenter', handleMouseEnter)
      section.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[50vh] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Soft Ambient Gradient Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(34, 211, 238, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 70%, rgba(34, 211, 238, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 text-center px-6">
        {/* Static Text */}
        <p className="text-3xl md:text-5xl font-light text-muted-foreground mb-4">
          Founders like you struggle with
        </p>

        {/* Dynamic Word */}
        <div className="h-[4rem] md:h-[6rem] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={activeWordIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="text-4xl md:text-6xl font-black text-white block drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]"
            >
              {STRUGGLES[activeWordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
