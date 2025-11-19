'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'
import { MagneticButton } from '../enhancements/magnetic-button'
import { RippleEffect } from '../enhancements/ripple-effect'
import { SuccessAnimation } from '../enhancements/success-animation'
import { HelpTooltip } from '../enhancements/help-tooltip'
import { triggerHaptic } from '../enhancements/haptic-feedback'
import { sanitizeHandle } from '@/lib/sanitize-client'

interface Screen2Props {
  onNext: () => void
  onBack: () => void
  formData: any
  setFormData: (data: any) => void
}

export function OnboardingScreen2({ onNext, onBack, formData, setFormData }: Screen2Props) {
  const [handle, setHandle] = useState(sanitizeHandle(formData.handle || ''))
  const [isValid, setIsValid] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Generate handle from name if empty
  useEffect(() => {
    if (!handle && formData.name) {
      const generated = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20)
      setHandle(generated)
    }
  }, [formData.name])

  // Validate handle using secure API endpoint
  useEffect(() => {
    const checkHandle = async () => {
      if (!handle || handle.length < 3) {
        setIsValid(false)
        return
      }

      // Check format: alphanumeric and underscores only
      if (!/^[a-z0-9_]+$/.test(handle)) {
        setIsValid(false)
        return
      }

      setIsChecking(true)
      
      try {
        // Use secure API endpoint with rate limiting
        const response = await fetch('/api/onboarding/check-handle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ handle }),
        })

        if (!response.ok) {
          if (response.status === 429) {
            const data = await response.json()
            toast.error(`Too many requests. Please wait ${Math.ceil(data.retryAfter / 60)} minutes.`)
            setIsValid(false)
            setIsChecking(false)
            return
          }
          setIsValid(false)
          setIsChecking(false)
          return
        }

        const data = await response.json()
        setIsValid(data.available === true && handle.length >= 3 && handle.length <= 20)
      } catch (error) {
        console.error('Handle check error:', error)
        setIsValid(false)
      } finally {
        setIsChecking(false)
      }
    }

    const timeout = setTimeout(checkHandle, 500)
    return () => clearTimeout(timeout)
  }, [handle])

  const handleContinue = () => {
    if (!isValid) {
      triggerHaptic('error')
      toast.error('Please choose a valid handle')
      return
    }

    triggerHaptic('success')
    setFormData({ ...formData, handle: handle.toLowerCase() })
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-10"
    >
      <div className="w-full max-w-lg space-y-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white">
            Choose your Builder ID
          </h2>
          <p className="text-white/60 text-lg">
            This becomes your public identity on Sipher.
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/60">Your Handle</label>
              <HelpTooltip
                content="Your handle appears in your public profile URL: sipher.in/@yourhandle. Choose something memorable and professional."
                position="right"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  // Sanitize input on change
                  const sanitized = sanitizeHandle(e.target.value)
                  setHandle(sanitized)
                  if (sanitized.length > 0) triggerHaptic('light')
                }}
                placeholder="srideep"
                maxLength={20}
                className="w-full pl-8 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:border-[#7B5CFF]/50 focus:ring-2 focus:ring-[#7B5CFF]/20 transition-all min-h-[44px]"
                aria-label="Choose your builder handle"
                aria-describedby="handle-help"
              />
              {isValid && !isChecking && (
                <SuccessAnimation show={true} />
              )}
            </div>
            {isChecking && (
              <p className="text-sm text-white/40" role="status" aria-live="polite">
                Checking availability...
              </p>
            )}
            {!isValid && handle.length > 0 && !isChecking && (
              <p className="text-sm text-red-400" role="alert">
                Handle unavailable or invalid
              </p>
            )}
            <p className="text-xs text-white/40" id="handle-help">
              {handle.length}/20 characters
            </p>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-white/40 mb-2">Preview:</p>
            <p className="text-white/80 font-mono text-lg">
              sipher.in/@{encodeURIComponent(handle || 'yourhandle')}
            </p>
          </div>

          <p className="text-xs text-white/40">
            Keep it clean. You can't change this later.
          </p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-4"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <RippleEffect>
            <MagneticButton
              onClick={handleContinue}
              disabled={!isValid || isChecking}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(123,92,255,0.4)] transition-all duration-300 min-h-[44px]"
            >
              Continue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </RippleEffect>
        </motion.div>
      </div>
    </motion.div>
  )
}

