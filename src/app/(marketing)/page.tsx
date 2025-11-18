'use client'

import React, { useState, useEffect, useRef, memo, Suspense } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  TrendingUp, 
  Users, 
  Zap,
  MapPin,
  Calendar,
  Award,
  Shield,
  Sparkles,
  Github,
  Linkedin,
  Twitter,
  ChevronDown,
  Star,
  X,
  Play,
  Clock,
  Target,
  BarChart3,
  Rocket,
  Lock,
  Unlock,
  MousePointerClick,
  Move,
  Eye,
  EyeOff,
  Layers,
  Compass,
  Navigation2,
  Filter,
  Megaphone,
  BookOpen,
  TrendingDown,
  Mail,
  Phone,
  ArrowLeftRight
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/landing/hero'
import FounderMirrorSection from '@/components/landing/FounderMirrorSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import ProofCardSection from '@/components/landing/proof/ProofCardSection'
import RoadmapSection from '@/components/landing/RoadmapSection'
import FounderLetterSection from '@/components/landing/FounderLetterSection'
import PulseNav from '@/components/navigation/PulseNav'
import { SkeletonCard } from '@/components/ui/skeleton'

// Only dynamically import truly heavy/interactive components
const IndiaPulseMap = dynamic(() => import('@/components/landing/pulse/IndiaPulseMap'), {
  loading: () => (
    <div className="w-full min-h-[600px] flex items-center justify-center">
      <SkeletonCard className="min-h-[600px] w-full" />
    </div>
  ),
  ssr: false, // Map is heavy, skip SSR
})

const LiveDemo = dynamic(() => import('@/components/live-demo/LiveDemo'), {
  loading: () => (
    <div className="w-full min-h-[500px] flex items-center justify-center">
      <SkeletonCard className="min-h-[500px] w-full" />
    </div>
  ),
  ssr: false, // Interactive component, skip SSR
})
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { WaitlistModal } from '@/components/landing/waitlist-modal'
import SipherAsterisk from '@/components/ui/SipherAsterisk'
import SipherFooter from '@/components/footer/SipherFooter'
import { useUIStore } from '@/lib/store'
import { BentoShowcase } from '@/components/landing/bento-showcase'
import { NextSectionButton } from '@/components/landing/NextSectionButton'

// Animated Counter Component
const AnimatedCounter = memo(function AnimatedCounter({ target, duration = 2, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    
    let start = 0
    const increment = target / (duration * 60)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{count.toLocaleString('en-US')}{suffix}</span>
})

// Interactive Tab Navigation
type TabType = 'problem' | 'solution' | 'playground' | 'proof' | 'pulse' | 'roadmap' | 'letter'

function LandingPageContent() {
  const { waitlistModalOpen, setWaitlistModalOpen, activeTab, setActiveTab } = useUIStore()
  const [localActiveTab, setLocalActiveTab] = useState<TabType>(activeTab as TabType || 'problem')
  const [waitlistCount, setWaitlistCount] = useState(0)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Sync local state with store
  useEffect(() => {
    setLocalActiveTab(activeTab as TabType || 'problem')
  }, [activeTab])

  // Handle error messages from URL params
  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error && message) {
      const decodedMessage = decodeURIComponent(message)
      
      // Show error toast
      if (error === 'database-error') {
        toast.error(decodedMessage, {
          duration: 6000,
          description: 'This might be a temporary issue. Please try again in a moment.',
        })
      } else if (error === 'auth-failed') {
        toast.error(decodedMessage, {
          duration: 5000,
        })
      } else {
        toast.error(decodedMessage || 'An error occurred', {
          duration: 5000,
        })
      }
      
      // Clear error from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      newUrl.searchParams.delete('message')
      router.replace(newUrl.pathname + newUrl.search, { scroll: false })
    }
  }, [searchParams, router])
  
  const handleTabSwitch = (tabId: TabType) => {
    setLocalActiveTab(tabId)
    setActiveTab(tabId)
    
    // Track section view
    import('@/lib/analytics/posthog').then(({ trackSectionView }) => {
      trackSectionView(tabId)
    })
    import('@vercel/analytics').then(({ track }) => {
      track('section_view', { section: tabId })
    })
  }
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  
  // Map dots state
  const [mapDots, setMapDots] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([])
  
  // ProofCard Calculator state
  const [commits, setCommits] = useState(0)
  const [features, setFeatures] = useState(0)
  const [activeDays, setActiveDays] = useState(0)
  
  // Interactive playground state
  const [playgroundEntries, setPlaygroundEntries] = useState<Array<{ id: string; text: string; date: Date; score: number }>>([])
  const [currentEntry, setCurrentEntry] = useState('')
  
  // Track explored sections for navigation feedback
  const [exploredSections, setExploredSections] = useState<Set<TabType>>(new Set(['problem']))
  
  // Live activity state
  const [liveActivity] = useState([
    { name: 'Rahul K.', location: 'Pune', action: ' joined the waitlist', time: 'Just now', score: null },
    { name: 'Sneha M.', location: 'Bangalore', action: ' calculated ProofCard: 87', time: '2 min ago', score: 87 },
    { name: 'Arvind S.', location: 'Delhi', action: ' joined the waitlist', time: '5 min ago', score: null },
    { name: 'Meera P.', location: 'Mumbai', action: ' calculated ProofCard: 92', time: '8 min ago', score: 92 },
    { name: 'Kiran R.', location: 'Hyderabad', action: ' joined the waitlist', time: '12 min ago', score: null },
  ])

  // Fetch waitlist count
  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch('/api/waitlist/count')
        if (response.ok) {
          const data = await response.json()
          setWaitlistCount(data.count || 0)
        }
      } catch (error) {
        console.error('Failed to fetch waitlist count:', error)
      }
    }
    
    fetchCount()
    // Update every 60 seconds
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  // Track tab exploration for navigation feedback
  useEffect(() => {
    if (activeTab && !exploredSections.has(activeTab as TabType)) {
      setExploredSections(prev => new Set([...prev, activeTab as TabType]))
    }
  }, [activeTab, exploredSections])

  // Calculate ProofCard score
  const calculateScore = () => {
    const consistency = Math.min(100, (activeDays / 30) * 100)
    const velocity = Math.min(100, (commits / 50) * 50 + (features / 10) * 50)
    const total = Math.round((consistency * 0.4) + (velocity * 0.6))
    return Math.min(100, total)
  }

  // Calculate playground score
  const calculatePlaygroundScore = () => {
    if (playgroundEntries.length === 0) return 0
    const consistency = Math.min(100, (playgroundEntries.length / 7) * 100)
    const recentEntries = playgroundEntries.filter(e => {
      const daysAgo = (Date.now() - e.date.getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo <= 7
    }).length
    return Math.round((consistency * 0.6) + (recentEntries * 5))
  }

  // Add playground entry
  const addPlaygroundEntry = () => {
    if (!currentEntry.trim()) return
    
    const newEntry = {
      id: Date.now().toString(),
      text: currentEntry,
      date: new Date(),
      score: Math.floor(Math.random() * 20) + 5
    }
    
    setPlaygroundEntries(prev => [newEntry, ...prev].slice(0, 30))
    setCurrentEntry('')
  }

  // Countdown to February 1, 2026
  useEffect(() => {
    const targetDate = new Date('2026-02-01T00:00:00').getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Generate map dots only on client side
  useEffect(() => {
    const dots = Array.from({ length: 20 }, () => ({
      left: Math.random() * 80 + 10,
      top: Math.random() * 80 + 10,
      duration: 2 + Math.random(),
      delay: Math.random() * 2,
    }))
    setMapDots(dots)
  }, [])

  // Listen for waitlist open event from footer
  useEffect(() => {
    const handleOpenWaitlist = () => {
      setWaitlistModalOpen(true)
    }
    
    window.addEventListener('openWaitlist', handleOpenWaitlist)
    return () => {
      window.removeEventListener('openWaitlist', handleOpenWaitlist)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // setWaitlistModalOpen is stable from Zustand, doesn't need to be in deps

  // Listen for tab switch event from footer
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: TabType }>
      if (customEvent.detail?.tabId) {
        handleTabSwitch(customEvent.detail.tabId)
      }
    }
    
    window.addEventListener('switchTab', handleSwitchTab as EventListener)
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab as EventListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // handleTabSwitch uses stable Zustand setters

  // Tab configuration - minimal labels only
  const tabs = [
    { id: 'problem' as TabType, label: 'Problem' },
    { id: 'solution' as TabType, label: 'Solution' },
    { id: 'playground' as TabType, label: 'Live Demo' },
    { id: 'proof' as TabType, label: 'ProofCard' },
    { id: 'pulse' as TabType, label: 'Pulse' },
    { id: 'roadmap' as TabType, label: 'Roadmap' },
    { id: 'letter' as TabType, label: 'Letter' },
  ]

  const { scrollY } = useScroll()
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Calculate scroll progress for pulse line
  const scrollProgress = useTransform(
    scrollY,
    [0, typeof window !== 'undefined' ? window.innerHeight * 2 : 1000],
    [0, 100]
  )
  
  // Transform scroll progress to line width
  const lineWidth = useTransform(scrollProgress, (value) => `${20 + (value * 0.8)}%`)
  
  // Calculate active tab position for pulse line node
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab)
  const activeTabPosition = tabs.length > 0 ? (activeTabIndex / (tabs.length - 1)) * 100 : 0
  
  // Track tab switch animation
  const [isSwitchingTabs, setIsSwitchingTabs] = useState(false)
  
  // Handle tab switch with pulse line animation
  const handleTabSwitchWithAnimation = (tabId: TabType) => {
    setIsSwitchingTabs(true)
    handleTabSwitch(tabId)
    setTimeout(() => setIsSwitchingTabs(false), 600)
  }

  // Ensure page starts at top on load and prevent hash scrolling
  useEffect(() => {
    // Scroll to top on initial load
    if (typeof window !== 'undefined') {
      // Remove hash from URL if present
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [])

  return (
    <>
      <main className="relative min-h-screen">
        {/* Hero Section - Always First */}
        <Hero />

        {/* Founder Mirror Section */}
        <FounderMirrorSection />

        {/* Founder Pulse Line Navigation - Ultra-minimal */}
        <PulseNav />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[80vh]"
          >
            {/* --- SECTION: PROBLEM — MINIMAL NOIR DESIGN --- */}
            {localActiveTab === 'problem' && (
              <>
                <ProblemSection />
                <NextSectionButton
                  currentTab="problem"
                  onNext={() => handleTabSwitch('solution')}
                  nextLabel="See the Solution"
                />
              </>
            )}

            {/* --- SECTION: SOLUTION — PREMIUM SOLUTION SECTION --- */}
            {localActiveTab === 'solution' && (
              <section id="solution" className="relative border-t border-border">
                <SolutionSection />
                <NextSectionButton
                  currentTab="solution"
                  onNext={() => handleTabSwitch('playground')}
                  nextLabel="Try Live Demo"
                />
              </section>
            )}

            {/* --- SECTION: PLAYGROUND — LIVE DEMO --- */}
            {localActiveTab === 'playground' && (
              <section id="demo" className="relative py-20 md:py-32 border-t border-border">
                <div className="container mx-auto px-4 sm:px-6">
                  <LiveDemo />
                </div>
                <NextSectionButton
                  currentTab="playground"
                  onNext={() => handleTabSwitch('proof')}
                  nextLabel="See ProofCard Examples"
                />
              </section>
            )}

            {/* --- SECTION: PROOF — EXECUTION VISUALIZATION --- */}
            {localActiveTab === 'proof' && (
              <section id="proof" className="relative border-t border-border">
                <div className="container mx-auto px-4 sm:px-6">
                  <ProofCardSection />
                </div>
                {/* Bento Box Showcase - 2025 UI Trend */}
                <BentoShowcase />
                <NextSectionButton
                  currentTab="proof"
                  onNext={() => handleTabSwitch('pulse')}
                  nextLabel="Explore India Pulse"
                />
              </section>
            )}

            {/* --- SECTION: PULSE — INDIA'S BUILDER MAP --- */}
            {localActiveTab === 'pulse' && (
              <section id="pulse" className="relative border-t border-border">
                <div className="container mx-auto px-4 sm:px-6">
                  <IndiaPulseMap />
                  <p className="text-xs text-muted-foreground text-center mt-6">
                    Full real-time visualization launching in Q2 2026.
                  </p>
                </div>
                <NextSectionButton
                  currentTab="pulse"
                  onNext={() => handleTabSwitch('roadmap')}
                  nextLabel="View Roadmap"
                />
              </section>
            )}

            {/* --- SECTION: ROADMAP — PREMIUM ROADMAP SECTION --- */}
            {localActiveTab === 'roadmap' && (
              <section id="roadmap" className="relative border-t border-border">
                <RoadmapSection />
                <NextSectionButton
                  currentTab="roadmap"
                  onNext={() => handleTabSwitch('letter')}
                  nextLabel="Read Founder Letter"
                />
              </section>
            )}

            {/* --- SECTION: LETTER — FOUNDER LETTER --- */}
            {localActiveTab === 'letter' && (
              <section id="letter" className="relative border-t border-border">
                <FounderLetterSection />
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Sticky CTA Bar */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl md:hidden"
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold">Join <AnimatedCounter target={waitlistCount + 100} suffix="+" /> founders</p>
            </div>
            <Button
              onClick={() => setWaitlistModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center gap-2 group"
            >
              Join Now
              <span className="sipher-ast-ring">
                <SipherAsterisk size={14} color="white" animated={false} ariaHidden={true} />
              </span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <SipherFooter />

      {/* Waitlist Modal */}
      {waitlistModalOpen && <WaitlistModal onClose={() => setWaitlistModalOpen(false)} />}
    </>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LandingPageContent />
    </Suspense>
  )
}
