'use client'

import { motion } from 'framer-motion'
import { Eye, CheckCircle2, TrendingUp, Clock } from 'lucide-react'

const PROOF_CARDS = [
  {
    id: 'c1',
    caption: 'Daily Build Log → transformed into proof',
    description: 'Shows how everyday shipping turns into verifiable execution.',
    founderNumber: 23,
    features: 12,
    commits: 47,
    days: 14,
    avgTime: 6,
    lastShipped: 'Fixed auth bug + added billing',
    timeline: [
      { day: 'Tue', task: 'Billing integration' },
      { day: 'Mon', task: 'UI cleanup, 4 bugs closed' },
      { day: 'Sun', task: 'Background job optimization' },
    ],
    score: 82,
  },
  {
    id: 'c2',
    caption: 'Your execution velocity → quantified',
    description: 'Features, commits, improvements — unified into a single score.',
    founderNumber: 18,
    features: 8,
    commits: 34,
    days: 10,
    avgTime: 4,
    lastShipped: 'Launched dashboard v2.0',
    timeline: [
      { day: 'Wed', task: 'Dashboard redesign' },
      { day: 'Tue', task: 'API rate limiting' },
      { day: 'Mon', task: 'User onboarding flow' },
    ],
    score: 78,
  },
  {
    id: 'c3',
    caption: 'Your timeline → instantly visible',
    description: 'Your weeks of work visualized clearly and beautifully.',
    founderNumber: 42,
    features: 15,
    commits: 62,
    days: 21,
    avgTime: 8,
    lastShipped: 'Added real-time notifications',
    timeline: [
      { day: 'Thu', task: 'Real-time notifications' },
      { day: 'Wed', task: 'Webhook integration' },
      { day: 'Tue', task: 'Performance optimization' },
    ],
    score: 85,
  },
  {
    id: 'c4',
    caption: 'Features, fixes & commits → unified',
    description: 'No scattered proof — everything captured in a single artifact.',
    founderNumber: 31,
    features: 9,
    commits: 41,
    days: 12,
    avgTime: 5,
    lastShipped: 'Refactored payment system',
    timeline: [
      { day: 'Fri', task: 'Payment refactor' },
      { day: 'Thu', task: 'Security audit fixes' },
      { day: 'Wed', task: 'Database migration' },
    ],
    score: 80,
  },
  {
    id: 'c5',
    caption: 'Your founder journey → discoverable',
    description: 'A timeline VCs can actually scroll and understand.',
    founderNumber: 56,
    features: 11,
    commits: 53,
    days: 16,
    avgTime: 7,
    lastShipped: 'Built analytics dashboard',
    timeline: [
      { day: 'Sat', task: 'Analytics dashboard' },
      { day: 'Fri', task: 'Data export feature' },
      { day: 'Thu', task: 'Chart visualizations' },
    ],
    score: 83,
  },
  {
    id: 'c6',
    caption: 'Your momentum → becomes your credential',
    description: 'Execution becomes a signal, not your college name.',
    founderNumber: 29,
    features: 14,
    commits: 58,
    days: 18,
    avgTime: 6,
    lastShipped: 'Multi-tenant architecture',
    timeline: [
      { day: 'Mon', task: 'Multi-tenant setup' },
      { day: 'Sun', task: 'Permission system' },
      { day: 'Sat', task: 'Role-based access' },
    ],
    score: 87,
  },
]

export function ProofWallSection() {
  return (
    <>
      <section 
        aria-labelledby="proofwall-title" 
        className="relative py-8 bg-transparent overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 
              id="proofwall-title" 
              className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3"
            >
              What You'll Build on <span className="text-purple-400">Sipher</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-2">
              Your ProofCard — a visible record of your real execution.
            </p>
            <p className="text-xs text-muted-foreground/80">
              These are preview examples. All data is anonymized placeholders.
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROOF_CARDS.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i, duration: 0.45 }}
                className="relative"
              >
                {/* Card Container */}
                <motion.div
                  className="relative rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] backdrop-blur-md shadow-xl"
                  style={{
                    WebkitBackdropFilter: 'blur(8px)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  }}
                  whileHover={{ 
                    y: -6, 
                    rotate: 0.5, 
                    scale: 1.01,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Neon Edge Glow */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl" aria-hidden>
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-[rgba(147,51,234,0.06)]" />
                    <motion.div 
                      className="absolute -inset-1 rounded-2xl blur-[18px]"
                      animate={{
                        opacity: [0.2, 0.35, 0.2],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ 
                        background: 'linear-gradient(90deg, rgba(147,51,234,0.08), rgba(59,130,246,0.06))' 
                      }}
                    />
                  </div>

                  {/* Preview Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(0,0,0,0.35)]/70 backdrop-blur text-white border border-[rgba(255,255,255,0.04)]">
                      <Eye className="w-3 h-3" />
                      Preview
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 min-h-[280px] flex flex-col justify-between relative z-10">
                    {/* Top: Anonymized Avatar + Founder Number */}
                    <div className="flex items-center gap-3 mb-4">
                      {/* Anonymized Avatar (Solid Circle) */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border-2 border-purple-400/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-300">
                          #{card.founderNumber.toString().slice(-1)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Founder #{card.founderNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Active builder
                        </div>
                      </div>
                    </div>

                    {/* Key Execution Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Features shipped</span>
                        <span className="font-semibold text-white">{card.features} this month</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Commits</span>
                        <span className="font-semibold text-white">{card.commits} in {card.days} days</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Avg. time-to-ship</span>
                        <span className="font-semibold text-white">{card.avgTime} hours</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <div className="text-xs text-muted-foreground mb-1">Last shipped:</div>
                        <div className="text-xs font-medium text-white">{card.lastShipped}</div>
                      </div>
                    </div>

                    {/* Mini Timeline */}
                    <div className="mb-4 space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">Recent activity:</div>
                      {card.timeline.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="text-purple-400 font-medium w-8">{item.day}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-white/80">{item.task}</span>
                        </div>
                      ))}
                    </div>

                    {/* Score Preview */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">ProofCard Score</span>
                        <span className="text-2xl font-black text-purple-400">
                          {card.score}<span className="text-sm text-muted-foreground">/100</span>
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${card.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Micro Wiggle Animation */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      x: [0, -0.5, 0.5, 0],
                      rotate: [0, -0.1, 0.1, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>

                {/* Caption Below Card */}
                <div className="mt-3">
                  <div className="text-sm font-medium text-white mb-1">
                    {card.caption}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {card.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 text-xs text-muted-foreground/80 text-center max-w-2xl mx-auto"
          >
            These are visual previews of the ProofCards you'll generate on Sipher — intentionally anonymized and not real user data.
          </motion.div>
        </div>
      </section>
    </>
  )
}