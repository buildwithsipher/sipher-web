'use client'

import { BentoGrid, BentoCard } from '@/components/ui/bento-grid'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Code2, TrendingUp, Calendar, BarChart3, Zap, Target, Users, Sparkles } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function BentoShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 md:py-32 px-4 sm:px-6 relative bg-[#0B0B0C] border-t border-white/[0.04]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                New
              </span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Your Execution, Organized
          </h2>
          <p className="text-lg md:text-xl text-[#8B8B8B] max-w-3xl mx-auto leading-relaxed">
            See how your daily work comes together — clean, organized, impossible to ignore.
            <br />
            <span className="text-white/70">This is how your ProofCard lives.</span>
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <BentoGrid className="mb-8">
          {/* Main ProofCard - Large */}
          <BentoCard span={2} rowSpan={2} delay={0}>
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">ProofCard Preview</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Your execution score visualized with minimal, elegant design
                </p>
              </div>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <ProgressRing
                  value={87}
                  size={120}
                  strokeWidth={4}
                  color="#7b5cff"
                  showValue={true}
                  label="Momentum"
                />
                <ProgressRing
                  value={92}
                  size={120}
                  strokeWidth={4}
                  color="#4aa8ff"
                  showValue={true}
                  label="Consistency"
                />
              </div>
            </div>
          </BentoCard>

          {/* Quick Stats - Total Logs */}
          <BentoCard span={1} rowSpan={1} delay={0.1}>
            <div className="h-full flex flex-col justify-between">
              <div>
                <Code2 className="w-5 h-5 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Total Logs</h3>
              </div>
              <div className="text-4xl font-black text-white">42</div>
              <p className="text-xs text-muted-foreground mt-2">This month</p>
            </div>
          </BentoCard>

          {/* Active Days */}
          <BentoCard span={1} rowSpan={1} delay={0.2}>
            <div className="h-full flex flex-col justify-between">
              <div>
                <Calendar className="w-5 h-5 text-cyan-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Active Days</h3>
              </div>
              <div className="text-4xl font-black text-white">28</div>
              <p className="text-xs text-muted-foreground mt-2">Out of 30</p>
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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Shipped payment integration</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Added UPI support</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
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
                7<span className="text-lg text-muted-foreground ml-1">days</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Keep it going!</p>
            </div>
          </BentoCard>

          {/* Community */}
          <BentoCard span={1} rowSpan={1} delay={0.5}>
            <div className="h-full flex flex-col justify-between">
              <div>
                <Users className="w-5 h-5 text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Founders</h3>
              </div>
              <div className="text-4xl font-black text-white">247+</div>
              <p className="text-xs text-muted-foreground mt-2">On the waitlist</p>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            Preview of your dashboard layout. Your execution, organized.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
