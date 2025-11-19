'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Clock } from 'lucide-react'

interface OnboardingStats {
  completedToday: number
  averageTime: string
  completionRate: string
}

export function SocialProof() {
  const [stats, setStats] = useState<OnboardingStats>({
    completedToday: 0,
    averageTime: '2.5 min',
    completionRate: '94%',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real stats from API
    fetch('/api/onboarding/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback to default stats
        setStats({
          completedToday: 127,
          averageTime: '2.5 min',
          completionRate: '94%',
        })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-4 text-white/40 text-sm">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        <span>Loading stats...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-6 text-sm text-white/60"
    >
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span>
          <span className="text-white font-semibold">{stats.completedToday}+</span> completed today
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>
          Avg: <span className="text-white font-semibold">{stats.averageTime}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        <span>
          <span className="text-white font-semibold">{stats.completionRate}</span> completion rate
        </span>
      </div>
    </motion.div>
  )
}

