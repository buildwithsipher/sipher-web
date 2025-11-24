'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface SuccessAnimationProps {
  show: boolean
  message?: string
  onComplete?: () => void
}

export function SuccessAnimation({ show, message, onComplete }: SuccessAnimationProps) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 text-[#10B981]"
      onAnimationComplete={onComplete}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center"
      >
        <Check className="w-3 h-3" />
      </motion.div>
      {message && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium"
        >
          {message}
        </motion.span>
      )}
    </motion.div>
  )
}
