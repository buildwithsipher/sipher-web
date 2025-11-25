'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { OnboardingScreen2 } from '@/components/onboarding/Screen2'
import { OnboardingScreen3 } from '@/components/onboarding/Screen3'
import { OnboardingScreen4 } from '@/components/onboarding/Screen4'
// Success screen component for waitlist onboarding
function SuccessScreen({
  userName,
  onViewDashboard,
}: {
  userName: string
  onViewDashboard: () => void
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden"
    >
      <div className="w-full max-w-md text-center space-y-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-light text-white">
          ✦ You&apos;re on the list, {userName.split(' ')[0]}!
        </h1>
        <p className="text-white/60 text-base md:text-lg">
          Your Sipher profile is being prepared.
          <br />
          We&apos;ll notify you when your cohort opens.
        </p>
        <button
          onClick={onViewDashboard}
          className="w-full px-6 py-4 bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(123,92,255,0.4)] transition-all duration-200 hover:scale-105 active:scale-95"
        >
          View Waitlist Dashboard
        </button>
      </div>
    </motion.div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState(2) // Start at Screen 2 (domain selection)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingData, setOnboardingData] = useState({
    domain: '',
    stage: '',
    name: '',
    startupName: '',
    city: '',
    linkedinUrl: '',
  })

  // Screen 0: Smart Auto-Check
  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        // Not signed in, redirect to home
        router.push('/')
        return
      }

      setUser(session.user)

      // Check if user already in waitlist
      const { data: waitlistUser } = await supabase
        .from('waitlist_users')
        .select('id, status')
        .eq('email', session.user.email)
        .single()

      if (waitlistUser) {
        // Already in database → redirect to dashboard
        if (waitlistUser.status === 'approved' || waitlistUser.status === 'activated') {
          router.push('/dashboard')
        } else {
          router.push('/waitlist/dashboard')
        }
        return
      }

      // Pre-fill name from Google
      if (session.user.user_metadata?.full_name) {
        setOnboardingData(prev => ({ ...prev, name: session.user.user_metadata.full_name }))
      }

      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleNext = () => {
    if (currentScreen < 5) {
      setCurrentScreen(currentScreen + 1)
    }
  }

  const handleBack = () => {
    if (currentScreen > 2) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  const handleComplete = async () => {
    // Map domain IDs to readable values
    const domainMap: Record<string, string> = {
      saas: 'SaaS',
      'ai-ml': 'AI/ML',
      consumer: 'Consumer',
      fintech: 'FinTech',
      edtech: 'EdTech',
      other: 'Other',
    }

    // Submit to waitlist API
    if (!user?.email) {
      alert('Please sign in first')
      return
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: onboardingData.name,
          startupName: onboardingData.startupName,
          startupStage: onboardingData.stage,
          city: onboardingData.city,
          whatBuilding: domainMap[onboardingData.domain] || onboardingData.domain,
          linkedinUrl: onboardingData.linkedinUrl?.trim() || '',
        }),
      })

      // Safely parse JSON response
      let result: { error?: string } = {}
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const text = await response.text()
          result = text ? JSON.parse(text) : {}
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError)
          throw new Error('Invalid response from server')
        }
      }

      if (!response.ok) {
        throw new Error(result.error || `Failed to join waitlist (${response.status})`)
      }

      // Track signup
      const { trackWaitlistSignup } = await import('@/lib/analytics/posthog')
      const { track } = await import('@vercel/analytics')

      trackWaitlistSignup({
        startup_stage: onboardingData.stage,
        city: onboardingData.city,
        startup_name: onboardingData.startupName,
      })
      track('waitlist_signup', {
        stage: onboardingData.stage,
        city: onboardingData.city,
      })

      // Move to success screen
      setCurrentScreen(5)
    } catch (error) {
      console.error('Submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      alert(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Progress Dots */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {[2, 3, 4].map(screen => (
          <div
            key={screen}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              screen <= currentScreen ? 'bg-[#7B5CFF] w-8' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Screen Content */}
      <AnimatePresence mode="wait">
        {currentScreen === 2 && (
          <OnboardingScreen2
            key="screen2"
            onNext={handleNext}
            onBack={() => router.push('/')}
            domain={onboardingData.domain}
            setDomain={domain => setOnboardingData(prev => ({ ...prev, domain }))}
            user={user}
          />
        )}
        {currentScreen === 3 && (
          <OnboardingScreen3
            key="screen3"
            onNext={handleNext}
            onBack={handleBack}
            stage={onboardingData.stage}
            setStage={stage => setOnboardingData(prev => ({ ...prev, stage }))}
          />
        )}
        {currentScreen === 4 && (
          <OnboardingScreen4
            key="screen4"
            onNext={handleComplete}
            onBack={handleBack}
            data={onboardingData}
            setData={setOnboardingData}
          />
        )}
        {currentScreen === 5 && (
          <SuccessScreen
            key="screen5"
            userName={onboardingData.name || 'Builder'}
            onViewDashboard={() => router.push('/waitlist/dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
