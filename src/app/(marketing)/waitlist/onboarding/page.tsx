'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/logo'
import { OnboardingScreen2 } from '@/components/onboarding/Screen2'
import { OnboardingScreen3 } from '@/components/onboarding/Screen3'
import { OnboardingScreen4 } from '@/components/onboarding/Screen4'
import { OnboardingScreen5 } from '@/components/onboarding/Screen5'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState(2) // Start at Screen 2 (domain selection)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingData, setOnboardingData] = useState({
    domain: '',
    stage: '',
    name: '',
    startupName: '',
    city: '',
  })

  // Screen 0: Smart Auto-Check
  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

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
      'saas': 'SaaS',
      'ai-ml': 'AI/ML',
      'consumer': 'Consumer',
      'fintech': 'FinTech',
      'edtech': 'EdTech',
      'other': 'Other',
    }
    
    // Submit to waitlist API
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
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join waitlist')
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
    } catch (error: any) {
      console.error('Submission error:', error)
      alert(error.message || 'Something went wrong')
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
        {[2, 3, 4].map((screen) => (
          <div
            key={screen}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              screen <= currentScreen
                ? 'bg-purple-500 w-8'
                : 'bg-white/20'
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
            setDomain={(domain) => setOnboardingData(prev => ({ ...prev, domain }))}
            user={user}
          />
        )}
        {currentScreen === 3 && (
          <OnboardingScreen3
            key="screen3"
            onNext={handleNext}
            onBack={handleBack}
            stage={onboardingData.stage}
            setStage={(stage) => setOnboardingData(prev => ({ ...prev, stage }))}
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
          <OnboardingScreen5
            key="screen5"
            userName={onboardingData.name}
            onViewDashboard={() => router.push('/waitlist/dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
