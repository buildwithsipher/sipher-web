'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'

interface Screen5Props {
  userName: string
  onViewDashboard: () => void
}

export function OnboardingScreen5({ userName, onViewDashboard }: Screen5Props) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden"
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 1,
                x: '50%',
                y: '50%',
                scale: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                x: `${50 + (Math.random() - 0.5) * 100}%`,
                y: `${50 + (Math.random() - 0.5) * 100}%`,
                scale: [0, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#7B61FF', '#A78BFA', '#C4B5FD', '#DDD6FE'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-md text-center space-y-8 relative z-10">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-purple-500" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-light text-white">
            ✦ You're on the list, {userName.split(' ')[0]}!
          </h1>
          <p className="text-white/60 text-base md:text-lg">
            Your Sipher profile is being prepared.
            <br />
            We'll notify you when your cohort opens.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={onViewDashboard}
          className="w-full px-6 py-4 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          View Waitlist Dashboard
        </motion.button>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xs text-white/40 pt-4"
        >
          Want early access? Invite 3 founders → get instant approval.
        </motion.p>
      </div>
    </motion.div>
  )
}

