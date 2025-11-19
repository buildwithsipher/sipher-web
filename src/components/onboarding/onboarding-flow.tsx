'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { OnboardingScreen1 } from './screens/screen1-welcome'
import { OnboardingScreen2 } from './screens/screen2-handle'
import { OnboardingScreen3 } from './screens/screen3-profile'
import { OnboardingScreen4 } from './screens/screen4-visibility'
import { OnboardingScreen5 } from './screens/screen5-how-it-works'
import { OnboardingScreen6 } from './screens/screen6-final'
import { useKeyboardNavigation, KeyboardHints } from './enhancements/keyboard-navigation'
import { useSwipeNavigation } from './enhancements/swipe-gestures'
import { MobileBottomNav } from './enhancements/mobile-bottom-nav'
import { ParticleBurst } from './enhancements/particle-burst'
import { useScreenReaderAnnouncement, useReducedMotion } from './enhancements/accessibility'
import { triggerHaptic } from './enhancements/haptic-feedback'
import { sanitizeName, sanitizeTagline, sanitizeText } from '@/lib/sanitize-client'
import { saveOnboardingProgress, loadOnboardingProgress, clearOnboardingProgress } from '@/lib/progress-persistence'

interface OnboardingFlowProps {
  user: any
  waitlistUser: any
}

export function OnboardingFlow({ user, waitlistUser }: OnboardingFlowProps) {
  const router = useRouter()
  
  // Try to load saved progress
  const savedProgress = loadOnboardingProgress()
  const initialScreen = savedProgress?.currentScreen || 1
  const initialFormData = savedProgress?.formData || {
    handle: '',
    name: sanitizeName(waitlistUser.name || ''),
    startupName: sanitizeName(waitlistUser.startup_name || ''),
    startupStage: sanitizeText(waitlistUser.startup_stage || '') || '',
    city: sanitizeText(waitlistUser.city || '') || '',
    tagline: sanitizeTagline(waitlistUser.what_building || '') || '',
    websiteUrl: waitlistUser.website_url || '',
    linkedinUrl: waitlistUser.linkedin_url || '',
    profilePictureUrl: waitlistUser.profile_picture_url || '',
    startupLogoUrl: waitlistUser.startup_logo_url || '',
    defaultVisibility: 'public' as 'public' | 'community' | 'investor',
  }
  
  const [currentScreen, setCurrentScreen] = useState(initialScreen)
  const [particleBurst, setParticleBurst] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { announce, AnnouncementRegion } = useScreenReaderAnnouncement()
  
  const [formData, setFormData] = useState(initialFormData)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Save progress whenever screen or formData changes
  useEffect(() => {
    saveOnboardingProgress({
      currentScreen,
      formData,
      timestamp: Date.now(),
    })
  }, [currentScreen, formData])

  const handleNext = () => {
    if (currentScreen < 6) {
      triggerHaptic('medium')
      setParticleBurst(true)
      setCurrentScreen(currentScreen + 1)
    }
  }

  const handleBack = () => {
    if (currentScreen > 1) {
      triggerHaptic('light')
      setCurrentScreen(currentScreen - 1)
    }
  }

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: handleNext,
    onBack: handleBack,
    disabled: false,
  })

  // Swipe gestures for mobile
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: handleNext,
    onSwipeRight: handleBack,
    enabled: isMobile,
  })

  // Screen reader announcements
  useEffect(() => {
    announce(`Screen ${currentScreen} of 6`, 'polite')
  }, [currentScreen, announce])

  const handleSkip = (screen: number) => {
    triggerHaptic('light')
    // Skip logic - move to next required screen
    if (screen === 3) {
      // Skip profile images
      handleNext()
    } else if (screen === 5) {
      // Skip education screen
      handleNext()
    }
  }

  const handleComplete = async () => {
    // Clear saved progress on completion
    clearOnboardingProgress()
    // This will be handled by Screen6
    router.push('/dashboard')
  }

  const canGoNext = currentScreen < 6
  const canGoBack = currentScreen > 1

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F] relative overflow-hidden"
      {...swipeHandlers}
    >
      <AnnouncementRegion />
      
      {/* Particle burst animation */}
      <ParticleBurst 
        trigger={particleBurst} 
        onComplete={() => setParticleBurst(false)}
      />

      {/* Animated background particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7B5CFF]/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4AA8FF]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      )}

      {/* Progress indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF]"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentScreen / 6) * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Screen dots indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {[1, 2, 3, 4, 5, 6].map((screen) => (
          <motion.div
            key={screen}
            className={`w-2 h-2 rounded-full transition-all ${
              screen === currentScreen
                ? 'bg-[#7B5CFF] w-8'
                : screen < currentScreen
                ? 'bg-[#7B5CFF]/50'
                : 'bg-white/10'
            }`}
            initial={false}
            animate={{
              scale: screen === currentScreen ? 1.2 : 1,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentScreen === 1 && (
          <OnboardingScreen1
            key="screen1"
            onNext={handleNext}
            firstName={waitlistUser.name?.split(' ')[0] || 'Builder'}
          />
        )}
        {currentScreen === 2 && (
          <OnboardingScreen2
            key="screen2"
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentScreen === 3 && (
          <OnboardingScreen3
            key="screen3"
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentScreen === 4 && (
          <OnboardingScreen4
            key="screen4"
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentScreen === 5 && (
          <OnboardingScreen5
            key="screen5"
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentScreen === 6 && (
          <OnboardingScreen6
            key="screen6"
            onComplete={handleComplete}
            onBack={handleBack}
            formData={formData}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <MobileBottomNav
          onNext={handleNext}
          onBack={handleBack}
          canGoNext={canGoNext}
          canGoBack={canGoBack}
          currentScreen={currentScreen}
          totalScreens={6}
          showSkip={currentScreen === 3 || currentScreen === 5}
          onSkip={() => handleSkip(currentScreen)}
        />
      )}

      {/* Keyboard hints (desktop only) */}
      {!isMobile && <KeyboardHints />}
    </div>
  )
}

