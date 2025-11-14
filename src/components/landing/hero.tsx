'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Logo } from '../shared/logo'
import SipherAsterisk from '@/components/ui/SipherAsterisk'
import { useSipherEnergy } from '@/contexts/SipherEnergyContext'
import { useUIStore } from '@/lib/store'

export function Hero() {
  const { setWaitlistModalOpen } = useUIStore()
  const [isCtaHovered, setIsCtaHovered] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() })
  const { energy, setCursorSpeed, setIsIdle, setIsMoving, triggerSectionSync } = useSipherEnergy()

  // Cursor tracking for aura effect - 70% speed, 0.12 easing
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const auraX = useSpring(mouseX, { stiffness: 12, damping: 25 }) // 0.12 easing = stiffness 12
  const auraY = useSpring(mouseY, { stiffness: 12, damping: 25 })

  // Transform for aura position - 150-250px radius
  const auraTranslateX = useTransform(auraX, (x) => x - 128) // 256px / 2 = 128px center
  const auraTranslateY = useTransform(auraY, (y) => y - 128)

  // Aura dynamic properties
  const [auraScale, setAuraScale] = useState(1)
  const [auraOpacity, setAuraOpacity] = useState(0.14) // Base opacity: 0.14-0.22
  const [isHoveringHero, setIsHoveringHero] = useState(false)
  const [cursorVelocity, setCursorVelocity] = useState(0)

  // Handle mouse move for aura effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return

      const rect = heroRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Calculate cursor velocity for dynamic opacity
      const now = Date.now()
      const timeDelta = Math.max(now - lastMousePos.current.time, 1)
      const distance = Math.sqrt(
        Math.pow(x - lastMousePos.current.x, 2) + Math.pow(y - lastMousePos.current.y, 2)
      )
      const velocity = distance / timeDelta // pixels per ms
      setCursorVelocity(velocity)
      setCursorSpeed(velocity * 1000) // Convert to pixels per second
      setIsMoving(true)

      lastMousePos.current = { x, y, time: now }

      // Update mouse position (aura follows at 70% speed via spring)
      mouseX.set(x)
      mouseY.set(y)

      // Dynamic opacity based on cursor speed (+20% if speed increases)
      const baseOpacity = 0.14
      const speedBoost = Math.min(velocity * 50, 0.08) // Max +8% opacity boost
      let dynamicOpacity = baseOpacity + speedBoost

      // Check proximity to CTA - expand to 1.3x within 80px
      if (ctaRef.current) {
        const ctaRect = ctaRef.current.getBoundingClientRect()
        const ctaCenterX = ctaRect.left + ctaRect.width / 2 - rect.left
        const ctaCenterY = ctaRect.top + ctaRect.height / 2 - rect.top
        const distance = Math.sqrt(
          Math.pow(x - ctaCenterX, 2) + Math.pow(y - ctaCenterY, 2)
        )
        const maxDistance = 80 // Snap within 80px
        if (distance < maxDistance) {
          const scale = 1 + (1 - distance / maxDistance) * 0.3 // 1.0x → 1.3x
          setAuraScale(scale)
          dynamicOpacity = Math.min(baseOpacity + 0.08, 0.22) // Increase opacity near CTA
        } else {
          setAuraScale(1)
        }
      }

      // Check proximity to headline - soft snap
      if (headlineRef.current) {
        const headlineRect = headlineRef.current.getBoundingClientRect()
        const headlineCenterX = headlineRect.left + headlineRect.width / 2 - rect.left
        const headlineCenterY = headlineRect.top + headlineRect.height / 2 - rect.top
        const distance = Math.sqrt(
          Math.pow(x - headlineCenterX, 2) + Math.pow(y - headlineCenterY, 2)
        )
        const maxDistance = 300
        if (distance < maxDistance) {
          // Soft snap effect
          const snapStrength = (1 - distance / maxDistance) * 0.08
          dynamicOpacity = Math.min(baseOpacity + snapStrength + speedBoost, 0.22)
        }
      }

      setAuraOpacity(Math.min(dynamicOpacity, 0.22)) // Clamp to 0.14-0.22
    }

    const handleMouseEnter = () => {
      setIsHoveringHero(true)
      setAuraOpacity(0.18)
    }

    const handleMouseLeave = () => {
      setIsHoveringHero(false)
      setAuraOpacity(0.07) // Fade to 0.07 opacity when idle
      setAuraScale(1)
      setIsIdle(true)
    }

    // Idle detection - fade aura after 2.5s
    let idleTimer: NodeJS.Timeout
    if (isHoveringHero && cursorVelocity < 0.1) {
      idleTimer = setTimeout(() => {
        setAuraOpacity(0.07) // Idle opacity
      }, 2500)
    }

    const heroElement = heroRef.current
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove)
      heroElement.addEventListener('mouseenter', handleMouseEnter)
      heroElement.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      clearTimeout(idleTimer)
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove)
        heroElement.removeEventListener('mouseenter', handleMouseEnter)
        heroElement.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [mouseX, mouseY, cursorVelocity, isHoveringHero, setCursorSpeed, setIsIdle, setIsMoving])

  // Sync with energy system - flash 5% brighter on section change
  useEffect(() => {
    if (energy.shouldSyncAura) {
      const originalOpacity = auraOpacity
      setAuraOpacity(Math.min(originalOpacity * 1.05, 0.22))
      setTimeout(() => setAuraOpacity(originalOpacity), 100)
    }
  }, [energy.shouldSyncAura, auraOpacity])

  // Mobile fallback - slow drifting background glow
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <>
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0b0b0c] pt-48"
      >
        {/* Execution Aura - Cursor Following Effect */}
        <motion.div
          className="absolute pointer-events-none -z-5 w-[256px] h-[256px] rounded-full blur-[100px] execution-aura-gradient"
          style={{
            x: auraTranslateX,
            y: auraTranslateY,
            opacity: isMobile ? 0.08 : auraOpacity, // Mobile: static low opacity
            scale: isMobile ? 1 : auraScale,
          }}
          animate={
            isMobile
              ? {
                  x: ['0%', '2%', '0%', '-2%', '0%'],
                  y: ['0%', '-2%', '0%', '2%', '0%'],
                }
              : {}
          }
          transition={
            isMobile
              ? {
                  duration: 20,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.5 },
                }
          }
        >
          {/* Internal shimmer - same as nav line */}
          {!isMobile && (
            <motion.div
              className="absolute inset-0 rounded-full animate-shimmer"
              style={{
                background:
                  'linear-gradient(135deg, transparent 0%, rgba(123, 92, 255, 0.15) 25%, rgba(74, 168, 255, 0.12) 50%, rgba(111, 221, 255, 0.15) 75%, transparent 100%)',
                backgroundSize: '200% 200%',
              }}
            />
          )}
        </motion.div>

        {/* Ambient Asterisk (Top-right corner) */}
        <motion.div
          className="absolute top-12 right-12 pointer-events-none opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <SipherAsterisk
            size={24}
            color="#7b5cff"
            className="sipher-ast-life sipher-ast-noir"
            animated={false}
            ariaHidden={true}
          />
        </motion.div>

        {/* Content Container - max-width 900px, centered */}
        <div className="relative z-10 w-full max-w-[900px] mx-auto px-6 text-center">
          {/* Logo - Keep Sipher Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-16 flex justify-center"
          >
            <Logo size="large" animated />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            ref={headlineRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="font-semibold tracking-tight leading-[0.95] mb-8 text-white"
            style={{
              fontSize: 'clamp(72px, 8vw, 96px)',
            }}
          >
            Your execution deserves to be seen.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="text-[15px] leading-relaxed mb-12 mx-auto max-w-[600px] text-white/70 flex items-center justify-center gap-2"
          >
            Where founders turn work → visibility → opportunity.
            <SipherAsterisk
              size={20}
              color="currentColor"
              className="sipher-ast-life opacity-60"
              ariaHidden={true}
            />
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6"
          >
            <motion.button
              ref={ctaRef}
              onClick={() => setWaitlistModalOpen(true)}
              onMouseEnter={() => setIsCtaHovered(true)}
              onMouseLeave={() => setIsCtaHovered(false)}
              onFocus={() => setIsCtaHovered(true)}
              onBlur={() => setIsCtaHovered(false)}
              className="px-8 py-4 bg-white text-[#0b0b0c] text-lg font-semibold rounded-lg transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Join the waitlist"
            >
              Join Waitlist
              <span className={`sipher-ast-ring ${isCtaHovered ? 'hovered' : ''}`}>
                <SipherAsterisk
                  size={16}
                  color="#0b0b0c"
                  animated={false}
                  ariaHidden={true}
                />
              </span>
            </motion.button>

            {/* Social Proof Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-sm text-white/60"
            >
              247+ founders already on the list
            </motion.p>
          </motion.div>

          {/* Scroll Indicator - Subtle & Clickable */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            onClick={() => {
              const founderMirror = document.querySelector('section');
              if (founderMirror) {
                founderMirror.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg p-2 transition-all duration-300 hover:bg-white/5"
            aria-label="Scroll to see how it works"
          >
            <motion.p
              className="text-xs text-white/40 mb-2 group-hover:text-white/60 transition-colors"
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              See how it works
            </motion.p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1.5 group-hover:border-white/40 transition-colors"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-1.5 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors"
              />
            </motion.div>
          </motion.button>
        </div>
      </section>

    </>
  )
}
