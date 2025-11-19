'use client'

import { motion } from 'framer-motion'
import { SkipForward } from 'lucide-react'
import { triggerHaptic } from './haptic-feedback'

interface SkipButtonProps {
  onSkip: () => void
  label?: string
  disabled?: boolean
  className?: string
}

export function SkipButton({
  onSkip,
  label = 'Skip for now',
  disabled = false,
  className = '',
}: SkipButtonProps) {
  const handleSkip = () => {
    if (disabled) return
    triggerHaptic('light')
    onSkip()
  }

  return (
    <motion.button
      onClick={handleSkip}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.95 }}
    >
      <SkipForward className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </motion.button>
  )
}

