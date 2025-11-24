'use client'

import { BentoGrid, BentoCard } from '@/components/ui/bento-grid'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Code2, TrendingUp, Calendar, BarChart3, Zap, Target } from 'lucide-react'

interface DashboardContentProps {
  userEmail: string
  mockData: {
    momentum: number
    consistency: number
    totalLogs: number
    activeDays: number
    streak: number
  }
}

export function DashboardContent({ userEmail, mockData }: DashboardContentProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Welcome back</h1>
        <p className="text-muted-foreground">{userEmail}</p>
      </div>

      {/* Bento Grid Layout - 2025 Trend */}
      <BentoGrid className="mb-8">
        {/* Main ProofCard - Large */}
        <BentoCard span={2} rowSpan={2} delay={0}>
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">ProofCard</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Your execution score based on daily logs
              </p>
            </div>
            <div className="flex items-center justify-center gap-8">
              <ProgressRing
                value={mockData.momentum}
                size={120}
                strokeWidth={4}
                color="#7b5cff"
                showValue={true}
                label="Momentum"
              />
              <ProgressRing
                value={mockData.consistency}
                size={120}
                strokeWidth={4}
                color="#4aa8ff"
                showValue={true}
                label="Consistency"
              />
            </div>
          </div>
        </BentoCard>

        {/* Quick Stats */}
        <BentoCard span={1} rowSpan={1} delay={0.1}>
          <div className="h-full flex flex-col justify-between">
            <div>
              <Code2 className="w-5 h-5 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Total Logs</h3>
            </div>
            <div className="text-4xl font-black text-white">{mockData.totalLogs}</div>
          </div>
        </BentoCard>

        {/* Active Days */}
        <BentoCard span={1} rowSpan={1} delay={0.2}>
          <div className="h-full flex flex-col justify-between">
            <div>
              <Calendar className="w-5 h-5 text-cyan-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Active Days</h3>
            </div>
            <div className="text-4xl font-black text-white">{mockData.activeDays}</div>
          </div>
        </BentoCard>

        {/* BuilderLog Feed */}
        <BentoCard span={2} rowSpan={1} delay={0.3}>
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="space-y-3 flex-1">
              <div className="text-sm text-muted-foreground">
                Your recent BuilderLog entries will appear here
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Streak */}
        <BentoCard span={1} rowSpan={1} delay={0.4}>
          <div className="h-full flex flex-col justify-between">
            <div>
              <Zap className="w-5 h-5 text-amber-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Current Streak</h3>
            </div>
            <div className="text-4xl font-black text-white">
              {mockData.streak}
              <span className="text-lg text-muted-foreground ml-1">days</span>
            </div>
          </div>
        </BentoCard>

        {/* Goals */}
        <BentoCard span={1} rowSpan={1} delay={0.5}>
          <div className="h-full flex flex-col justify-between">
            <div>
              <Target className="w-5 h-5 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">This Week</h3>
            </div>
            <div className="text-sm text-muted-foreground">Log 5 more entries to hit your goal</div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Coming Soon Section */}
      <div className="glass-card rounded-xl p-8 border border-white/10">
        <h2 className="text-2xl font-semibold mb-4 text-white">Coming Soon</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• BuilderLog — Daily execution tracking</li>
          <li>• ProofCard — Your execution credential</li>
          <li>• The Forge — Resources & tools</li>
          <li>• Discovery — Find opportunities</li>
        </ul>
      </div>
    </div>
  )
}
