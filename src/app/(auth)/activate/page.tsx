'use client'

import { useState, Suspense, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

function ActivateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlToken = searchParams.get('token') || ''
  const [token, setToken] = useState(urlToken)
  const [loading, setLoading] = useState(false)
  const [autoActivating, setAutoActivating] = useState(false)
  const [activationStatus, setActivationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const hasAutoActivated = useRef(false)

  const handleActivate = useCallback(async (tokenToActivate?: string, isAuto = false) => {
    const tokenValue = tokenToActivate || token.trim()

    if (!tokenValue) {
      if (!isAuto) {
        toast.error('Please enter your activation token')
      }
      setAutoActivating(false)
      return
    }

    setLoading(true)
    if (isAuto) {
      setAutoActivating(true)
    }

    try {
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenValue }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Activation failed')
      }

      // Success - show success state briefly before redirect
      setActivationStatus('success')
      
      if (data.magicLink) {
        // Redirect to magic link for automatic login (best UX)
        setTimeout(() => {
          window.location.href = data.magicLink
        }, 1000) // Brief delay to show success state
      } else if (data.redirect) {
        setTimeout(() => {
          router.push(data.redirect)
        }, 1000)
      } else {
        toast.success('Account activated! Please sign in.')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      }
    } catch (error) {
      console.error('Activation error:', error)
      setActivationStatus('error')
      setAutoActivating(false)
      
      // Show error message
      const errorMessage = error.message || 'Failed to activate account. Please check your token and try again.'
      
      if (isAuto) {
        // If auto-activation failed, show error but allow manual retry
        toast.error(errorMessage, {
          duration: 5000,
          description: 'You can try entering the token manually below.',
        })
      } else {
        toast.error(errorMessage)
      }
      
      setLoading(false)
    }
  }, [router, token])

  // Auto-activate if token is in URL (production-ready flow)
  useEffect(() => {
    // Only auto-activate once, and only if we have a token from URL
    if (urlToken && !hasAutoActivated.current && activationStatus === 'idle') {
      hasAutoActivated.current = true
      setAutoActivating(true)
      handleActivate(urlToken, true)
    }
  }, [urlToken, activationStatus, handleActivate])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleActivate()
  }

  // Show loading state during auto-activation
  if (autoActivating && !activationStatus) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-[#7B5CFF] mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Activating your account...</h2>
            <p className="text-white/60">Please wait while we set everything up</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show success state briefly before redirect
  if (activationStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Account Activated!</h2>
            <p className="text-white/60">Redirecting you now...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Activate Your Account</h1>
            <p className="text-white/60">
              {urlToken && activationStatus === 'error'
                ? 'Automatic activation failed. Please try again below.'
                : 'Enter your activation token to get started'}
            </p>
          </div>

          {activationStatus === 'error' && urlToken && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-400">
                <p className="font-medium">Activation failed</p>
                <p className="text-red-400/80 mt-1">
                  The token may be invalid or expired. Please check your email and try again.
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="token" className="text-white/80">
                Activation Token
              </Label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Enter your activation token"
                className="mt-2 bg-white/5 border-white/10 text-white"
                disabled={loading}
                autoFocus
              />
              <p className="mt-2 text-xs text-white/40">
                Find your activation token in the email we sent you
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                'Activate Account'
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
          <div className="text-white/60">Loading...</div>
        </div>
      }
    >
      <ActivateForm />
    </Suspense>
  )
}
