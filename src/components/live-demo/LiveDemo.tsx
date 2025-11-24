'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion'
import SipherAsterisk from '@/components/ui/SipherAsterisk'

type ActivityCategory = 'Growth' | 'Product' | 'Ops' | 'Content' | 'Revenue'

type Activity = {
  id: string
  text: string
  ts: number
  category: ActivityCategory
  timestampText: string
}

const INDIAN_PLACEHOLDERS = [
  'Launched UPI integration',
  'Added PayTM support',
  'Closed 3 retail partners',
  'Ran 12 user interviews',
  'Published launch trailer',
  'Improved checkout flow',
  'Reduced delivery cost by 9%',
  'Hosted feedback call with 14 users',
  'Enabled GST invoice download',
  'Negotiated supplier cost –5%',
  'Onboarded 3 shops in Gachibowli',
  'Fixed UPI QR not scanning',
  'Published Diwali campaign page',
]

const TIMESTAMP_OPTIONS = ['Just now', 'a few seconds ago', 'moments ago', 'just logged']

// Category color mapping (like Linear's issue list)
const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  Growth: '#10b981', // green
  Product: '#8b5cf6', // purple
  Ops: '#06b6d4', // cyan
  Content: '#f59e0b', // amber
  Revenue: '#ef4444', // red
}

// Infer category from activity text
const inferCategory = (text: string): ActivityCategory => {
  const lower = text.toLowerCase()
  if (lower.includes('launched') || lower.includes('published') || lower.includes('campaign'))
    return 'Growth'
  if (
    lower.includes('fixed') ||
    lower.includes('added') ||
    lower.includes('improved') ||
    lower.includes('enabled')
  )
    return 'Product'
  if (
    lower.includes('negotiated') ||
    lower.includes('supplier') ||
    lower.includes('onboarded') ||
    lower.includes('shops')
  )
    return 'Ops'
  if (lower.includes('interview') || lower.includes('feedback') || lower.includes('campaign'))
    return 'Content'
  if (
    lower.includes('reduced') ||
    lower.includes('cost') ||
    lower.includes('closed') ||
    lower.includes('retail')
  )
    return 'Revenue'
  return 'Product' // default
}

const randomPlaceholder = () =>
  INDIAN_PLACEHOLDERS[Math.floor(Math.random() * INDIAN_PLACEHOLDERS.length)]

export default function LiveDemo() {
  const [input, setInput] = useState('')
  const [placeholder, setPlaceholder] = useState(randomPlaceholder)
  const [timelineIndex, setTimelineIndex] = useState<number>(0) // used to shift timeline
  const [dots, setDots] = useState<number[]>(() => Array(7).fill(0)) // 7 conceptual dots
  const [activities, setActivities] = useState<Activity[]>([])
  const [proofCardGlow, setProofCardGlow] = useState(false)
  const [sparkPulse, setSparkPulse] = useState(false)
  const [buttonHover, setButtonHover] = useState(false)
  const [inputFocus, setInputFocus] = useState(false)
  const [glowUnderline, setGlowUnderline] = useState(false)
  const reduced = useReducedMotion()
  const ariaRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)

  // Execution Aura - Cursor tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const auraX = useSpring(mouseX, { stiffness: 12, damping: 25 })
  const auraY = useSpring(mouseY, { stiffness: 12, damping: 25 })
  const auraTranslateX = useTransform(auraX, x => x - 128)
  const auraTranslateY = useTransform(auraY, y => y - 128)
  const [auraScale, setAuraScale] = useState(1)
  const [auraOpacity, setAuraOpacity] = useState(0.12)
  const [isHoveringSection, setIsHoveringSection] = useState(false)

  // Cleanup/expiry time for activities (ms)
  const ACTIVITY_LIFETIME = 12_000

  // Focus input on mount for quick demo
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Placeholder rotation (gentle)
  useEffect(() => {
    const t = setInterval(() => setPlaceholder(randomPlaceholder), 5000)
    return () => clearInterval(t)
  }, [])

  // Execution Aura - Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      mouseX.set(x)
      mouseY.set(y)

      // Dynamic opacity based on cursor speed
      const baseOpacity = 0.12
      setAuraOpacity(baseOpacity)
    }

    const handleMouseEnter = () => {
      setIsHoveringSection(true)
      setAuraOpacity(0.18)
    }

    const handleMouseLeave = () => {
      setIsHoveringSection(false)
      setAuraOpacity(0.08)
      setAuraScale(1)
    }

    const sectionElement = sectionRef.current
    if (sectionElement) {
      sectionElement.addEventListener('mousemove', handleMouseMove)
      sectionElement.addEventListener('mouseenter', handleMouseEnter)
      sectionElement.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (sectionElement) {
        sectionElement.removeEventListener('mousemove', handleMouseMove)
        sectionElement.removeEventListener('mouseenter', handleMouseEnter)
        sectionElement.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [mouseX, mouseY])

  // Mobile fallback
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Add a new activity (safe conceptual demo)
  const addActivity = useCallback(
    (text: string) => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 6)
      const category = inferCategory(text)
      const timestampText = TIMESTAMP_OPTIONS[Math.floor(Math.random() * TIMESTAMP_OPTIONS.length)]
      const act: Activity = {
        id,
        text,
        ts: Date.now(),
        category,
        timestampText,
      }

      setActivities(prev => {
        const next = [act, ...prev].slice(0, 4) // keep a bit more to allow fades
        return next
      })

      // Timeline shift + dot pulse
      setTimelineIndex(i => i + 1) // increment to animate translate
      setDots(prev => {
        // Shift left: remove first dot, add new dot at end
        // This creates the left-shift effect when rendered
        const newDots = [...prev.slice(1), 1]
        return newDots
      })

      // ProofCard glow effect (subtle scale 1.00 → 1.03)
      setProofCardGlow(true)
      setTimeout(() => setProofCardGlow(false), reduced ? 0 : 800)

      // Glow Underline Pulse effect
      setGlowUnderline(true)
      setTimeout(() => setGlowUnderline(false), reduced ? 200 : 900)

      // Sipher Spark Pulse signature motion
      setSparkPulse(true)
      setTimeout(() => setSparkPulse(false), reduced ? 0 : 1400)

      // Announce to screen readers (polite)
      if (ariaRef.current) {
        ariaRef.current.textContent = `Logged: ${text}`
        // Clear after announcement
        setTimeout(() => {
          if (ariaRef.current) ariaRef.current.textContent = ''
        }, 1000)
      }

      // Schedule fade-out removal older than ACTIVITY_LIFETIME
      setTimeout(() => {
        setActivities(prev => prev.filter(p => p.id !== id))
      }, ACTIVITY_LIFETIME)
    },
    [reduced]
  )

  // Submit handler
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const val = input.trim()
    if (!val) return
    addActivity(val)
    setInput('')
    // Return focus to input for quick logging
    inputRef.current?.focus()
  }

  // Quick log via example placeholder click — useful on mobile
  const quickLogPlaceholder = () => {
    addActivity(placeholder)
  }

  // Timeline transform (CSS translate %)
  // Each new log shifts the timeline left by one dot width (1/7th of container)
  const timelineTranslate = (timelineIndex % 7) * (100 / 7)

  // Accessibility: reduced motion fallback for timeline/pulse
  const dotPulseClass = reduced ? 'opacity-100' : 'animate-dot-pulse'

  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-4xl mx-auto py-12 md:py-16 lg:py-20 px-4 sm:px-6"
      aria-labelledby="live-demo-title"
    >
      {/* Execution Aura - Cursor Following Effect */}
      <motion.div
        className="absolute pointer-events-none z-0 w-[256px] h-[256px] rounded-full blur-[100px] execution-aura-gradient"
        style={{
          x: auraTranslateX,
          y: auraTranslateY,
          opacity: isMobile ? 0.08 : auraOpacity,
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
        {/* Internal shimmer */}
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
      <div className="relative z-10 text-center mb-10 md:mb-16 lg:mb-20">
        <h3
          id="live-demo-title"
          className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-white mb-4 md:mb-6 lg:mb-8 px-2"
        >
          See Sipher in Action
        </h3>
        <p className="text-sm md:text-base lg:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed px-2">
          A 10-second interactive preview of how your daily work becomes visible proof. This is a
          conceptual demo — not our scoring engine.
        </p>
        {/* Transparency Note */}
        <p className="text-xs text-muted-foreground/60 max-w-xl mx-auto mb-6 md:mb-8 leading-relaxed px-2">
          This demo does not represent real scoring. Sipher's actual algorithm adapts to your stage,
          industry, and execution pattern.
        </p>
        {/* Divider line */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />
      </div>

      <div className="relative z-10 grid gap-4 md:gap-6 md:grid-cols-3 items-start">
        {/* Left: Builder Log */}
        <div className="md:col-span-1 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 md:p-5 lg:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <label
              htmlFor="builder-log-input"
              className="block text-xs text-muted-foreground uppercase tracking-wider mb-3"
            >
              What did you ship today?
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="builder-log-input"
                ref={inputRef}
                aria-label="What did you ship today"
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                placeholder={placeholder}
                className={`flex-1 px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 text-sm text-white placeholder:text-muted-foreground transition-all duration-300 ${
                  inputFocus && !reduced
                    ? 'focus:ring-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.1)]'
                    : 'focus:ring-purple-500'
                }`}
              />
              <motion.button
                type="submit"
                onMouseEnter={() => setButtonHover(true)}
                onMouseLeave={() => setButtonHover(false)}
                animate={buttonHover && !reduced ? { x: -2, scale: 1.02 } : { x: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium hover:from-purple-600 hover:to-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-indigo-500 transition-colors w-full sm:w-auto"
              >
                Log
                <SipherAsterisk size={14} color="white" animated={false} ariaHidden={true} />
              </motion.button>
            </div>
            <div className="text-xs text-muted-foreground">
              Example:{' '}
              <button
                type="button"
                onClick={quickLogPlaceholder}
                className="underline text-xs text-purple-300 hover:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1 break-words sm:whitespace-nowrap"
              >
                Quick log: {placeholder}
              </button>
            </div>
          </form>

          <div className="mt-5 md:mt-6">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              Timeline (7 days)
            </div>
            <div className="overflow-hidden rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
              <div
                className="relative h-10 flex items-center"
                style={{
                  // Use transform for shift; lighter compute
                  transform: `translateX(-${timelineTranslate}%)`,
                  transition: reduced ? 'none' : 'transform 420ms cubic-bezier(.2,.9,.2,1)',
                  willChange: reduced ? 'auto' : 'transform',
                }}
              >
                {/* Render 14 dots (double array) so shifting is seamless */}
                {Array.from({ length: 14 }, (_, i) => {
                  const dotIndex = i % 7
                  const value = dots[dotIndex] ?? 0
                  // New dot appears at position 7 (rightmost visible), then shifts left
                  const isNew = i === 7 && value === 1
                  const isLogging = isNew && !reduced

                  return (
                    <motion.div
                      key={`dot-${i}`}
                      aria-hidden="true"
                      className={`mr-3 rounded-full bg-white/[0.08] border border-white/[0.06] flex-shrink-0 flex items-center justify-center ${
                        isNew ? dotPulseClass : ''
                      }`}
                      animate={
                        isLogging
                          ? {
                              scale: [0.5, 1, 1],
                              x: [0, -2, 2, 0],
                              width: [8, 24, 24],
                              height: [8, 24, 24],
                            }
                          : {
                              scale: 1,
                              x: 0,
                              width: 24,
                              height: 24,
                            }
                      }
                      transition={{
                        duration: 1.2,
                        ease: 'easeOut',
                      }}
                      style={{
                        width: isNew && !reduced ? undefined : 24,
                        height: isNew && !reduced ? undefined : 24,
                        boxShadow: isNew
                          ? '0 0 8px rgba(124,58,237,0.4), 0 6px 18px rgba(124,58,237,0.22)'
                          : undefined,
                        filter: isNew && !reduced ? 'blur(0.5px)' : undefined,
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: ProofCard preview */}
        <div className="md:col-span-1 relative">
          {/* Sipher Spark Pulse - Signature Motion */}
          {sparkPulse && !reduced && (
            <motion.div
              className="absolute top-16 right-16 pointer-events-none z-10"
              initial={{ opacity: 0, rotate: -12, scale: 0.8 }}
              animate={{ opacity: [0, 0.6, 0], rotate: [0, 8, 12], scale: [0.8, 1, 1.1] }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            >
              <SipherAsterisk
                size={24}
                color="#a78bfa"
                className="sipher-ast-glow opacity-40"
                ariaHidden={true}
              />
            </motion.div>
          )}

          <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 md:p-5 lg:p-6 flex flex-col">
            <div>
              <div className="flex items-start justify-between gap-3 md:gap-4 mb-5 md:mb-6">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm md:text-base lg:text-lg font-bold text-white mb-1.5 md:mb-2">
                    ProofCard — preview
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A visual preview of how your work looks as proof.
                  </p>
                </div>
                <motion.div
                  className="text-purple-400"
                  animate={
                    proofCardGlow && !reduced
                      ? {
                          scale: [1, 1.15, 1],
                          opacity: [0.6, 1, 0.6],
                        }
                      : {}
                  }
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <SipherAsterisk
                    size={20}
                    color="#a78bfa"
                    className="sipher-ast-glow"
                    ariaHidden={true}
                  />
                </motion.div>
              </div>

              <motion.div
                aria-hidden="true"
                className="mt-5 md:mt-6 p-3 md:p-4 lg:p-5 rounded-lg border bg-gradient-to-br from-white/[0.03] to-black/10 transition-all duration-300 relative"
                style={{
                  borderImage:
                    'linear-gradient(to bottom right, rgba(255,255,255,0.08), rgba(255,255,255,0.04)) 1',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                animate={
                  proofCardGlow && !reduced
                    ? {
                        scale: [1, 1.03, 1],
                        boxShadow: [
                          '0 4px 12px rgba(0,0,0,0.1)',
                          '0 0 20px rgba(124,58,237,0.3), 0 8px 24px rgba(124,58,237,0.2)',
                          '0 4px 12px rgba(0,0,0,0.1)',
                        ],
                      }
                    : {
                        scale: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }
                }
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {/* Glow underline labels */}
                <div className="text-xs text-muted-foreground mb-3 md:mb-4 flex items-center gap-2 md:gap-3 flex-wrap">
                  {/* Momentum with glow underline */}
                  <div className="relative inline-block pb-1">
                    <span
                      className={`text-xs ${glowUnderline && reduced ? 'text-white transition-colors duration-200' : ''}`}
                    >
                      Momentum
                    </span>
                    {glowUnderline && !reduced && <span className="glow-underline" />}
                  </div>

                  {/* Consistency with glow underline */}
                  <div className="relative inline-block pb-1">
                    <span
                      className={`text-xs ${glowUnderline && reduced ? 'text-white transition-colors duration-200' : ''}`}
                    >
                      Consistency
                    </span>
                    {glowUnderline && !reduced && <span className="glow-underline" />}
                  </div>

                  {/* Your proof gets stronger with glow underline */}
                  <div className="relative inline-block pb-1">
                    <span
                      className={`text-xs ${glowUnderline && reduced ? 'text-white transition-colors duration-200' : ''}`}
                    >
                      Your proof gets stronger
                    </span>
                    {glowUnderline && !reduced && <span className="glow-underline" />}
                  </div>
                </div>

                {/* Work logged section */}
                <div className="flex items-start gap-2.5 md:gap-3 mb-4 md:mb-5">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-400/10 flex items-center justify-center flex-shrink-0">
                    <SipherAsterisk
                      size={14}
                      color="#a78bfa"
                      className="opacity-80 md:w-4 md:h-4"
                      ariaHidden={true}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-xs md:text-sm mb-1 md:mb-1.5">
                      Work logged • added to your ProofCard
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      No numbers shown in demo — conceptual only.
                    </div>
                  </div>
                </div>

                {/* Micro transparency text */}
                <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-white/[0.04]">
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    This preview shows the concept. Real ProofCard uses actual stage, domain, and
                    execution patterns.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="mt-5 md:mt-6 text-xs text-muted-foreground leading-relaxed">
              Tip: Try logging a few items. Watch the timeline and activity evolve.
            </div>
          </div>
        </div>

        {/* Right: Activity feed */}
        <div className="md:col-span-1 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h5 className="text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
              Recent activity
            </h5>
            <div className="text-xs text-muted-foreground whitespace-nowrap">Live preview</div>
          </div>

          <div className="space-y-2.5 md:space-y-3 min-h-[160px] md:min-h-[180px]">
            {activities.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No logs yet — try the quick log above.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {activities.slice(0, 3).map((a, idx) => {
                  // newer items first
                  const categoryColor = CATEGORY_COLORS[a.category]
                  return (
                    <motion.div
                      key={a.id}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.36 }}
                      className="relative p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5 group hover:bg-white/[0.05] transition-colors"
                      role="status"
                      aria-live="polite"
                    >
                      {/* Category color strip (like Linear) */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <SipherAsterisk
                          size={11}
                          color="#a78bfa"
                          className="opacity-80"
                          ariaHidden={true}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground border border-white/[0.04] whitespace-nowrap">
                            {a.category}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-white truncate">{a.text}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {a.timestampText}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Hidden aria-live for screen readers */}
      <div ref={ariaRef} className="sr-only" aria-live="polite" aria-atomic="true" />
    </section>
  )
}
