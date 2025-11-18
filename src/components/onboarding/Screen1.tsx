'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/shared/logo'
import { Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Screen1Props {
  onNext: () => void
  user: any
}

export function OnboardingScreen1({ onNext, user }: Screen1Props) {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/waitlist/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
      // Will redirect to Google OAuth
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in with Google')
      setLoading(false)
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-20"
    >
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Logo size="large" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-white/70 text-sm md:text-base"
        >
          "Where founders turn execution → proof"
        </motion.p>

        {/* Waitlist Count Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60"
        >
          100+ founders are building already
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-light text-white">
            👋 Join the Waitlist
          </h1>
        </motion.div>

        {/* Google Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-[#0D0D0D] rounded-xl font-medium hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Chrome className="w-5 h-5" />
              Continue with Google
            </>
          )}
        </motion.button>

        {/* Small Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-xs text-white/50"
        >
          No spam. 1-click. Takes 5 seconds.
        </motion.p>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="pt-8 text-xs text-white/40 flex items-center justify-center gap-4"
        >
          <button className="hover:text-white/60 transition-colors">Privacy</button>
          <span>•</span>
          <button className="hover:text-white/60 transition-colors">Terms</button>
        </motion.div>
      </div>
    </motion.div>
  )
}

