'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Globe, Users, Lock } from 'lucide-react'

interface OnboardingFormData {
  defaultVisibility?: 'public' | 'community' | 'investor'
  [key: string]: unknown
}

interface Screen4Props {
  onNext: () => void
  onBack: () => void
  formData: OnboardingFormData
  setFormData: (data: OnboardingFormData) => void
}

export function OnboardingScreen4({ onNext, onBack, formData, setFormData }: Screen4Props) {
  const [selected, setSelected] = useState<'public' | 'community' | 'investor'>(
    formData.defaultVisibility || 'public'
  )

  const options = [
    {
      value: 'public' as const,
      icon: Globe,
      title: 'Public — Recommended',
      description:
        'Your BuilderLog & ProofCard are visible to anyone. Builds your founder identity.',
      recommended: true,
    },
    {
      value: 'community' as const,
      icon: Users,
      title: 'Community Only',
      description: 'Visible only to approved Sipher founders.',
      recommended: false,
    },
    {
      value: 'investor' as const,
      icon: Lock,
      title: 'Investor-Only — Coming Soon',
      description: 'For sensitive logs. Launching later.',
      recommended: false,
      disabled: true,
    },
  ]

  const handleContinue = () => {
    setFormData({ ...formData, defaultVisibility: selected })
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
      <div className="w-full max-w-2xl space-y-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white">
            Choose how your work is shared.
          </h2>
          <p className="text-white/60 text-lg">You can change this per log later.</p>
        </motion.div>

        {/* Options */}
        <div className="space-y-4">
          {options.map((option, index) => {
            const Icon = option.icon
            const isSelected = selected === option.value
            const isDisabled = option.disabled

            return (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !isDisabled && setSelected(option.value)}
                disabled={isDisabled}
                className={`w-full glass-card rounded-2xl p-6 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-2 border-[#7B5CFF] shadow-[0_0_30px_rgba(123,92,255,0.3)] scale-[1.02]'
                    : 'border border-white/10 hover:border-white/20 hover:scale-[1.01]'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-[#7B5CFF]/20 text-[#7B5CFF]' : 'bg-white/5 text-white/60'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-white">{option.title}</h3>
                      {option.recommended && (
                        <span className="px-2 py-0.5 bg-[#7B5CFF]/20 text-[#7B5CFF] text-xs rounded-full">
                          Recommended
                        </span>
                      )}
                      {isDisabled && (
                        <span className="px-2 py-0.5 bg-white/10 text-white/40 text-xs rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{option.description}</p>
                  </div>
                  {isSelected && !isDisabled && (
                    <div className="w-6 h-6 rounded-full bg-[#7B5CFF] flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Navigation - Hidden on mobile (using MobileBottomNav instead) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="hidden md:flex items-center justify-between gap-4 pt-4"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleContinue}
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(123,92,255,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
