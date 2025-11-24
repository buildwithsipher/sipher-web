'use client'

import { motion } from 'framer-motion'
import { Logo } from '@/components/shared/logo'
import { ArrowRight } from 'lucide-react'
import { MagneticButton } from '../enhancements/magnetic-button'
import { RippleEffect } from '../enhancements/ripple-effect'
import { triggerHaptic } from '../enhancements/haptic-feedback'

interface Screen1Props {
  onNext: () => void
  firstName: string
}

export function OnboardingScreen1({ onNext, firstName }: Screen1Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-10"
    >
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <Logo size="large" />
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
            Welcome, <span className="font-semibold text-[#7B5CFF]">{firstName}</span>.
          </h1>
          <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-xl mx-auto">
            You're now part of the <span className="text-white font-medium">1% of founders</span>{' '}
            building with visible proof.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="pt-8"
        >
          <RippleEffect>
            <MagneticButton
              onClick={() => {
                triggerHaptic('medium')
                onNext()
              }}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] text-white rounded-xl font-semibold text-lg hover:shadow-[0_0_30px_rgba(123,92,255,0.4)] transition-all duration-300 flex items-center gap-2 mx-auto min-h-[44px]"
            >
              Continue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </RippleEffect>
        </motion.div>

        {/* Footer Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-sm text-white/40 italic pt-12"
        >
          "Proof over pedigree." — Sipher
        </motion.p>
      </div>
    </motion.div>
  )
}
