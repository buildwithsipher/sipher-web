'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FocusTrap } from '@/components/ui/focus-trap'
import { Logo } from '@/components/shared/logo'
import { trackFormStart } from '@/lib/analytics/posthog'

interface WaitlistModalProps {
  onClose: () => void
}

export function WaitlistModal({ onClose }: WaitlistModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(0)

  // Track form start when modal opens
  useEffect(() => {
    trackFormStart('waitlist')
    
    // Fetch waitlist count
    const fetchCount = async () => {
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
  }, [])

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
      // Modal will close on redirect
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in with Google')
      setLoading(false)
    }
  }

  const displayedCount = waitlistCount + 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-2xl p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
        >
          <FocusTrap active={true} onEscape={onClose}>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            <div className="text-center space-y-6">
              <div className="space-y-3">
                <Logo size="medium" />
                <p className="text-white/60 text-sm">
                  "Where founders turn execution → proof"
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs text-purple-400">
                    {displayedCount > 100 ? `${displayedCount.toLocaleString()}+` : '100+'} founders are building already
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h2 id="waitlist-modal-title" className="text-2xl font-light text-white">
                  👋 Join the Waitlist
                </h2>

                <motion.button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-white text-[#0D0D0D] rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-white/40">
                  No spam. 1-click. Takes 5 seconds.
                </p>
              </div>

              <div className="pt-4 text-xs text-white/30 space-x-4">
                <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
                <span>•</span>
                <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
              </div>
            </div>
          </FocusTrap>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

