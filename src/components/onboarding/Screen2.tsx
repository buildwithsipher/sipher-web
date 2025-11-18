'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface Screen2Props {
  onNext: () => void
  onBack: () => void
  domain: string
  setDomain: (domain: string) => void
  user?: any
}

const DOMAINS = [
  { id: 'saas', label: 'SaaS', icon: '☁️' },
  { id: 'ai-ml', label: 'AI/ML', icon: '🤖' },
  { id: 'consumer', label: 'Consumer', icon: '📱' },
  { id: 'fintech', label: 'FinTech', icon: '💳' },
  { id: 'edtech', label: 'EdTech', icon: '📚' },
  { id: 'other', label: 'Other', icon: '🚀' },
]

export function OnboardingScreen2({ onNext, onBack, domain, setDomain, user }: Screen2Props) {
  const canProceed = domain !== ''

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-20"
    >
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl md:text-3xl font-light text-white">
            ✦ Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            Let's learn what you're building
          </p>
          <p className="text-white/50 text-sm mt-1">
            1️⃣ What are you building?
          </p>
        </motion.div>

        {/* Domain Tiles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {DOMAINS.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setDomain(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
                domain === item.id
                  ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className={`text-sm font-medium ${
                domain === item.id ? 'text-white' : 'text-white/70'
              }`}>
                {item.label}
              </div>
              {domain === item.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-between pt-4"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              canProceed
                ? 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

