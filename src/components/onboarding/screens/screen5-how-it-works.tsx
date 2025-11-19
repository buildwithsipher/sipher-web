'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Flame, TrendingUp, Rocket } from 'lucide-react'

interface Screen5Props {
  onNext: () => void
  onBack: () => void
}

export function OnboardingScreen5({ onNext, onBack }: Screen5Props) {
  const features = [
    {
      icon: Flame,
      title: 'Log your work in BuilderLog',
      description: 'Document your daily execution and ship consistently.',
    },
    {
      icon: TrendingUp,
      title: 'Your ProofCard updates automatically',
      description: 'Watch your score build as you ship more.',
    },
    {
      icon: Rocket,
      title: 'Share your public builder identity',
      description: 'Build credibility with visible proof of execution.',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-10"
    >
      <div className="w-full max-w-2xl space-y-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white">
            How Sipher Works
          </h2>
        </motion.div>

        {/* Features */}
        <div className="space-y-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#7B5CFF]/20 text-[#7B5CFF] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Microcopy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/40 text-sm"
        >
          Your score begins after your first log.
        </motion.p>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between gap-4 pt-4"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={onNext}
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(123,92,255,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Got it
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

