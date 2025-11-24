'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { triggerHaptic } from './haptic-feedback'

interface MobileBottomNavProps {
  onNext: () => void
  onBack: () => void
  canGoNext: boolean
  canGoBack: boolean
  currentScreen: number
  totalScreens: number
  showSkip?: boolean
  onSkip?: () => void
}

export function MobileBottomNav({
  onNext,
  onBack,
  canGoNext,
  canGoBack,
  currentScreen,
  totalScreens,
  showSkip = false,
  onSkip,
}: MobileBottomNavProps) {
  const handleNext = () => {
    triggerHaptic('medium')
    onNext()
  }

  const handleBack = () => {
    triggerHaptic('light')
    onBack()
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="glass-card border-t border-white/10 p-4 safe-area-bottom">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF]"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentScreen / totalScreens) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2 text-center">
            Step {currentScreen} of {totalScreens}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <motion.button
            onClick={handleBack}
            disabled={!canGoBack}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </motion.button>

          {showSkip && onSkip && (
            <button onClick={onSkip} className="px-4 py-3 text-white/60 text-sm min-h-[44px]">
              Skip
            </button>
          )}

          <motion.button
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            whileTap={{ scale: 0.95 }}
          >
            <span>Continue</span>
            {canGoNext && <ArrowRight className="w-5 h-5" />}
            {!canGoNext && <Check className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
