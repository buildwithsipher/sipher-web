'use client'

import React, { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import SipherAsterisk from '@/components/ui/SipherAsterisk'

export default function SolutionSection() {
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null)

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 md:py-20 lg:py-32 px-4 sm:px-6 relative"
      style={{
        background:
          'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 50%), #0B0B0C',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20 lg:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 md:mb-8 leading-tight px-2"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Sipher makes your <span className="text-purple-400">execution</span> visible.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed px-2"
          >
            Log your work daily. Build your <span className="text-purple-400">ProofCard</span>. Get
            discovered for execution, not pedigree.
          </motion.p>
        </div>

        {/* Three Cinematic Solution Pillars */}
        <div className="space-y-0 mb-20 md:mb-24">
          {/* Pillar 1: BuilderLog */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="py-12 md:py-16 border-b border-purple-500/10 first:border-t"
          >
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                1. <span className="text-purple-400">BuilderLog</span>
              </h3>
              <p className="text-lg md:text-xl text-white/80 mb-3 leading-relaxed">
                Turn your daily work into a living history.
              </p>
              <p className="text-base md:text-lg text-white/70 leading-relaxed">
                Your updates become clean, time-stamped proof of your momentum.
              </p>
            </div>
          </motion.div>

          {/* Pillar 2: ProofCard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="py-12 md:py-16 border-b border-purple-500/10"
          >
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                2. <span className="text-purple-400">ProofCard</span>
              </h3>
              <p className="text-lg md:text-xl text-white/80 mb-3 leading-relaxed">
                Your execution, made visible.
              </p>
              <p className="text-base md:text-lg text-white/70 leading-relaxed">
                Your logs transform into an elegant record of discipline, velocity, and progress.
              </p>
            </div>
          </motion.div>

          {/* Pillar 3: Discovery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="py-12 md:py-16 border-b border-purple-500/10"
          >
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                3. <span className="text-purple-400">Discovery</span>
              </h3>
              <p className="text-lg md:text-xl text-white/80 mb-3 leading-relaxed">
                Investors find you through proof, not pedigree.
              </p>
              <p className="text-base md:text-lg text-white/70 leading-relaxed">
                Your execution becomes a signal — not your college name.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Cinematic 3-Panel Visual Strip */}
        <div className="grid md:grid-cols-3 gap-6 mb-20 md:mb-24">
          {/* Panel A: You log your work */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            onMouseEnter={() => setHoveredPanel(0)}
            onMouseLeave={() => setHoveredPanel(null)}
            className="relative rounded-xl backdrop-blur-sm border border-white/[0.08] p-6 md:p-8 bg-white/[0.02] overflow-hidden group cursor-pointer transition-all duration-300"
            whileHover={reduced ? {} : { scale: 1.01 }}
            style={{
              boxShadow:
                hoveredPanel === 0 && !reduced
                  ? '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(96, 165, 250, 0.1)'
                  : undefined,
            }}
          >
            {/* Soft pulse animation on hover */}
            {hoveredPanel === 0 && !reduced && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <div className="relative z-10">
              <h4 className="text-lg md:text-xl font-semibold text-white mb-4">
                You log your work.
              </h4>
              {/* BuilderLog entry card placeholder */}
              <div className="mt-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <SipherAsterisk
                      size={12}
                      color="#a78bfa"
                      className="opacity-60"
                      ariaHidden={true}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 mb-1">Shipped payment integration</div>
                    <div className="text-xs text-[#8B8B8B]">2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Panel B: Your ProofCard updates */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            onMouseEnter={() => setHoveredPanel(1)}
            onMouseLeave={() => setHoveredPanel(null)}
            className="relative rounded-xl backdrop-blur-sm border border-white/[0.08] p-6 md:p-8 bg-white/[0.02] overflow-hidden group cursor-pointer transition-all duration-300"
            whileHover={reduced ? {} : { scale: 1.01 }}
            style={{
              boxShadow:
                hoveredPanel === 1 && !reduced
                  ? '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(96, 165, 250, 0.1)'
                  : undefined,
            }}
          >
            <div className="relative z-10">
              <h4 className="text-lg md:text-xl font-semibold text-white mb-4">
                Your ProofCard updates.
              </h4>
              {/* ProofCard preview with glow underline */}
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-[#8B8B8B]">Momentum</span>
                  <div className="relative inline-block pb-1">
                    <span className="text-sm text-[#8B8B8B]">Consistency</span>
                    {hoveredPanel === 1 && !reduced && <span className="glow-underline" />}
                  </div>
                </div>
                <div className="h-16 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-white/[0.06] flex items-center justify-center">
                  <span className="text-xs text-[#8B8B8B]">ProofCard preview</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Panel C: Your visibility increases */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            onMouseEnter={() => setHoveredPanel(2)}
            onMouseLeave={() => setHoveredPanel(null)}
            className="relative rounded-xl backdrop-blur-sm border border-white/[0.08] p-6 md:p-8 bg-white/[0.02] overflow-hidden group cursor-pointer transition-all duration-300"
            whileHover={reduced ? {} : { scale: 1.01 }}
            style={{
              boxShadow:
                hoveredPanel === 2 && !reduced
                  ? '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(96, 165, 250, 0.1)'
                  : undefined,
            }}
          >
            {/* Subtle shimmer background on hover */}
            {hoveredPanel === 2 && !reduced && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <div className="relative z-10">
              <h4 className="text-lg md:text-xl font-semibold text-white mb-4">
                Your visibility increases.
              </h4>
              <p className="text-sm text-[#8B8B8B] leading-relaxed mt-4">
                Your movement becomes your signal.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Section Footer Microcopy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center"
        >
          <p className="text-xl md:text-2xl text-[#8B8B8B] leading-relaxed group cursor-default mb-8">
            <span className="inline-block transition-all duration-300 group-hover:text-white">
              With Sipher:
            </span>
            <br className="md:hidden" />
            <span className="inline-block ml-2 md:ml-0 transition-all duration-300 group-hover:text-purple-400/80">
              build in silence,
            </span>
            <br className="hidden md:inline" />{' '}
            <span className="inline-block transition-all duration-300 group-hover:text-cyan-400/80">
              be discovered for your movement.
            </span>
          </p>

          {/* CTA - See It In Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={() => {
                const event = new CustomEvent('switchTab', { detail: { tabId: 'playground' } })
                window.dispatchEvent(event)
                setTimeout(() => {
                  const demoSection = document.getElementById('demo')
                  if (demoSection) {
                    demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
              className="px-6 py-3 border border-white/20 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:border-white/40 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="See live demo in action"
            >
              See It In Action →
            </button>
            <p className="text-xs text-white/40">Join 247+ founders tracking their execution</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
