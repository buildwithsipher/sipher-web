'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface OnboardingFormData {
  handle: string
  name: string
  startupName: string
  startupStage: string
  city: string
  tagline: string
  websiteUrl: string
  linkedinUrl: string
  profilePictureUrl: string
  startupLogoUrl: string
  defaultVisibility: 'public' | 'community' | 'investor'
}

interface Screen6Props {
  onComplete: () => void
  onBack: () => void
  formData: OnboardingFormData
}

export function OnboardingScreen6({ onComplete, onBack, formData }: Screen6Props) {
  const [isCompleting, setIsCompleting] = useState(false)
  const router = useRouter()

  // Generate confetti particle positions once on mount
  const confettiParticles = useState(() =>
    Array.from({ length: 12 }, () => ({
      x: 50 + (Math.random() - 0.5) * 100,
      y: 50 + (Math.random() - 0.5) * 100,
    }))
  )[0]

  const handleComplete = async () => {
    setIsCompleting(true)

    try {
      // Use secure API endpoint with server-side validation
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409 && data.suggestions) {
          // Handle conflict - show suggestions
          toast.error(`Handle "${formData.handle}" is already taken. Try: ${data.suggestions[0]}`)
          setIsCompleting(false)
          return
        }

        if (response.status === 429) {
          toast.error(`Too many attempts. Please wait ${Math.ceil(data.retryAfter / 60)} minutes.`)
          setIsCompleting(false)
          return
        }

        if (response.status === 400 && data.details) {
          // Validation errors
          const firstError = data.details[0]
          toast.error(firstError?.message || 'Validation failed')
          setIsCompleting(false)
          return
        }

        throw new Error(data.error || 'Failed to complete onboarding')
      }

      toast.success('Onboarding complete!')

      // Clear any saved progress
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sipher_onboarding_progress')
      }

      // Small delay for animation
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error) {
      console.error('Completion error:', error)
      // Generic error message (don't expose details)
      toast.error('Failed to complete onboarding. Please try again.')
      setIsCompleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-10"
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiParticles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#7B5CFF] rounded-full"
            initial={{
              x: '50%',
              y: '50%',
              opacity: 0,
            }}
            animate={{
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.6,
              delay: i * 0.1,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl text-center space-y-8 relative z-10">
        {/* Pulsing glow behind title */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7B5CFF]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[#7B5CFF]" />
            <h1 className="text-5xl md:text-6xl font-light text-white">You&apos;re ready, builder.</h1>
            <Sparkles className="w-6 h-6 text-[#7B5CFF]" />
          </div>
          <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed">
            Your ProofCard starts with your first ship.
            <br />
            Make your execution visible.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
        >
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="group relative px-8 py-4 bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] text-white rounded-xl font-semibold text-lg hover:shadow-[0_0_40px_rgba(123,92,255,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCompleting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Completing...</span>
              </>
            ) : (
              <>
                Log Your First Work
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            onClick={() => router.push(`/@${encodeURIComponent(formData.handle || '')}`)}
            className="group px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
          >
            View My Builder Profile
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Back button - Hidden on mobile (using MobileBottomNav instead) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onBack}
          className="hidden md:flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors mx-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>
      </div>
    </motion.div>
  )
}
