'use client'

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Problem', href: '#problem', id: 'problem' },
  { label: 'Solution', href: '#solution', id: 'solution' },
  { label: 'Live Demo', href: '#demo', id: 'playground' },
  { label: 'ProofCard', href: '#proof', id: 'proof' },
  { label: 'Pulse', href: '#pulse', id: 'pulse' },
  { label: 'Roadmap', href: '#roadmap', id: 'roadmap' },
  { label: 'Letter', href: '#letter', id: 'letter' },
]

export default function PulseNav() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<string>('problem')
  const [indicatorPosition, setIndicatorPosition] = useState({ left: 0, width: 0 })
  const [scrolled, setScrolled] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track scroll for navbar background enhancement
  useMotionValueEvent(scrollY, 'change', latest => {
    setScrolled(latest > 50)
  })

  // Listen for tab switch events from landing page
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>
      if (customEvent.detail?.tabId) {
        setIsTransitioning(true)
        setActiveTab(customEvent.detail.tabId)
        // Reset transition state after animation completes
        setTimeout(() => setIsTransitioning(false), 600)
      }
    }

    window.addEventListener('switchTab', handleSwitchTab as EventListener)
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab as EventListener)
    }
  }, [])

  // Update indicator position when active tab changes
  useEffect(() => {
    const updatePosition = () => {
      const activeIndex = NAV_ITEMS.findIndex(item => item.id === activeTab)
      if (activeIndex >= 0 && buttonRefs.current[activeIndex] && containerRef.current) {
        const button = buttonRefs.current[activeIndex]
        const container = containerRef.current
        const buttonRect = button.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        const left = buttonRect.left - containerRect.left + buttonRect.width / 2 - 2
        setIndicatorPosition({ left, width: 4 })
      }
    }

    // Initial position
    updatePosition()

    // Update on active tab change
    const timeoutId = setTimeout(updatePosition, 0)

    // Also update on window resize
    window.addEventListener('resize', updatePosition)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePosition)
    }
  }, [activeTab])

  const scrollTo = (href: string, id: string) => {
    // Close mobile menu if open
    setIsMobileMenuOpen(false)

    // Trigger transition animation
    setIsTransitioning(true)
    // First, dispatch the tab switch event to render the section
    const event = new CustomEvent('switchTab', { detail: { tabId: id } })
    window.dispatchEvent(event)
    setActiveTab(id)
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 600)

    // Wait for the section to render, then scroll to it
    // Use multiple attempts to find the element since it's conditionally rendered
    const attemptScroll = (attempts: number = 0) => {
      if (attempts > 10) return // Max 10 attempts (500ms total)

      const el = document.querySelector(href)
      if (el) {
        const navbarHeight = isMobile ? 80 : 120 // Navbar height + padding
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = Math.max(0, elementPosition - navbarHeight)

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      } else {
        // Retry after a short delay
        setTimeout(() => attemptScroll(attempts + 1), 50)
      }
    }

    // Start attempting after a small delay to allow React to render
    setTimeout(() => attemptScroll(), 100)
  }

  return (
    <motion.div
      className="w-full fixed top-0 left-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Enhanced glassmorphism background with scroll effect */}
      <motion.div
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background: scrolled
            ? 'linear-gradient(180deg, rgba(11, 11, 12, 0.85) 0%, rgba(11, 11, 12, 0.75) 100%)'
            : 'linear-gradient(180deg, rgba(11, 11, 12, 0.4) 0%, rgba(11, 11, 12, 0.2) 100%)',
        }}
        animate={{
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px) saturate(150%)',
        }}
        transition={{ duration: 0.3 }}
      />

      <motion.nav className="relative flex flex-col items-center pt-4 md:pt-7 pb-3 md:pb-5 px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex w-full flex-col items-center">
          <div
            ref={containerRef}
            className="flex gap-8 md:gap-12 text-sm md:text-base font-medium relative pb-5"
          >
            {NAV_ITEMS.map((item, index) => {
              const isActive = activeTab === item.id
              const isHovered = hoveredIndex === index

              return (
                <motion.button
                  key={item.href}
                  ref={el => {
                    buttonRefs.current[index] = el
                  }}
                  onClick={() => scrollTo(item.href, item.id)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative group px-3 py-2"
                  data-index={index}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <motion.span
                    className={`relative z-10 transition-all duration-300 font-medium ${
                      isActive
                        ? 'text-purple-400'
                        : isHovered
                          ? 'text-purple-400/80'
                          : 'text-white/50'
                    }`}
                    animate={{
                      fontWeight: isActive ? 600 : 500,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden w-full">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-between w-full py-2 px-2"
            aria-label="Toggle menu"
          >
            <span
              className={`text-sm font-medium transition-colors ${
                isMobileMenuOpen ? 'text-purple-400' : 'text-white/50'
              }`}
            >
              {NAV_ITEMS.find(item => item.id === activeTab)?.label || 'Menu'}
            </span>
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white/70" />
              ) : (
                <Menu className="w-5 h-5 text-white/70" />
              )}
            </motion.div>
          </button>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-3 space-y-1">
                  {NAV_ITEMS.map((item, index) => {
                    const isActive = activeTab === item.id
                    return (
                      <button
                        key={item.href}
                        onClick={() => scrollTo(item.href, item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'text-purple-400 bg-purple-500/10'
                            : 'text-white/60 hover:text-purple-400/80 hover:bg-white/5'
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Single Minimal Pulse Line - Enhanced Animation */}
        <div className="relative w-full max-w-4xl h-[1px] overflow-visible hidden md:block">
          {/* Subtle base line */}
          <div className="absolute inset-0 bg-purple-500/10" />

          {/* Single flowing wave - minimal and elegant */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(167, 139, 250, 0.5) 30%, rgba(139, 92, 246, 0.9) 50%, rgba(167, 139, 250, 0.5) 70%, transparent 100%)',
              width: '50%',
              height: '100%',
            }}
            animate={{
              x: ['-50%', '150%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Active indicator with enhanced transition animation */}
          <motion.div
            className="absolute top-0 h-full bg-purple-400 rounded-full"
            layoutId="pulseIndicator"
            style={{
              left: `${indicatorPosition.left}px`,
              width: '2px',
            }}
            animate={{
              boxShadow: isTransitioning
                ? [
                    '0 0 8px rgba(167, 139, 250, 0.8)',
                    '0 0 16px rgba(167, 139, 250, 1), 0 0 24px rgba(139, 92, 246, 0.6)',
                    '0 0 8px rgba(167, 139, 250, 0.8)',
                  ]
                : '0 0 8px rgba(167, 139, 250, 0.8)',
              scaleY: isTransitioning ? [1, 1.5, 1] : 1,
            }}
            transition={{
              layout: {
                type: 'spring',
                stiffness: 400,
                damping: 35,
                mass: 0.8,
              },
              boxShadow: {
                duration: 0.6,
                ease: 'easeInOut',
              },
              scaleY: {
                duration: 0.6,
                ease: 'easeInOut',
              },
            }}
          />

          {/* Pulse effect on transition - subtle glow expansion */}
          {isTransitioning && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${indicatorPosition.left}px`,
                width: '4px',
                height: '4px',
                background: 'radial-gradient(circle, rgba(167, 139, 250, 0.8) 0%, transparent 70%)',
                filter: 'blur(2px)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 3, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            />
          )}
        </div>
      </motion.nav>
    </motion.div>
  )
}
