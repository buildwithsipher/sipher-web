'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface NextSectionButtonProps {
  currentTab: string
  onNext: () => void
  nextLabel: string
}

export function NextSectionButton({ currentTab, onNext, nextLabel }: NextSectionButtonProps) {
  const tabs = ['problem', 'solution', 'playground', 'proof', 'pulse', 'roadmap', 'letter']
  const currentIndex = tabs.indexOf(currentTab)
  const isLast = currentIndex === tabs.length - 1

  if (isLast) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex justify-center mt-12 mb-8"
    >
      <button
        onClick={onNext}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onNext()
          }
        }}
        className="group flex items-center gap-2 px-6 py-3 border border-white/20 text-white/70 text-sm font-medium rounded-lg transition-all duration-300 hover:border-white/40 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-label={`Navigate to ${nextLabel}`}
      >
        <span>{nextLabel}</span>
        <ChevronRight
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </button>
    </motion.div>
  )
}
