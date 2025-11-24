'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles, Rocket, TrendingUp, Zap, Users } from 'lucide-react'

interface Screen3Props {
  onNext: () => void
  onBack: () => void
  stage: string
  setStage: (stage: string) => void
}

const STAGES = [
  {
    id: 'idea',
    label: 'Idea Stage',
    description: 'Just starting, validating, exploring',
    icon: Sparkles,
    color: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-500/30',
  },
  {
    id: 'mvp',
    label: 'Building MVP',
    description: 'Actively shipping core product',
    icon: Rocket,
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'launched',
    label: 'Launched',
    description: 'Product live, early users',
    icon: Zap,
    color: 'from-green-500/20 to-green-600/10',
    borderColor: 'border-green-500/30',
  },
  {
    id: 'revenue',
    label: 'Early Revenue',
    description: 'Paying users/traction',
    icon: TrendingUp,
    color: 'from-yellow-500/20 to-yellow-600/10',
    borderColor: 'border-yellow-500/30',
  },
  {
    id: 'scaling',
    label: 'Scaling',
    description: 'Growth engine, team expansion',
    icon: Users,
    color: 'from-pink-500/20 to-pink-600/10',
    borderColor: 'border-pink-500/30',
  },
]

export function OnboardingScreen3({ onNext, onBack, stage, setStage }: Screen3Props) {
  const canProceed = stage !== ''

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-20"
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl md:text-3xl font-light text-white">
            Where are you in the journey?
          </h2>
        </motion.div>

        {/* Stage Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {STAGES.map(item => {
            const Icon = item.icon
            const isSelected = stage === item.id

            return (
              <motion.button
                key={item.id}
                onClick={() => setStage(item.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? `${item.color} ${item.borderColor} shadow-lg`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-white/5'}`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-white/60'}`} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-medium mb-1 ${
                        isSelected ? 'text-white' : 'text-white/90'
                      }`}
                    >
                      {item.label}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-white/70' : 'text-white/50'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                  >
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
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
