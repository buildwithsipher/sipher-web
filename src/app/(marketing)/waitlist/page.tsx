// src/app/(public)/page.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0D0D0D] text-center text-white">
      {/* --- Glow Background Pulse --- */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/20 via-black to-black" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px]" />

      {/* --- Hero Content --- */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="px-6"
      >
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          The Founder <span className="text-purple-400">Operating System*</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-white/70">
          Where founders prove <span className="text-white">execution</span>, not pedigree. Log your
          journey. Show progress. Earn credibility through proof.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/waitlist"
            className="group inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-500"
          >
            Join the Waitlist
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>

      {/* --- Subtext / FOMO Section --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-16 text-sm text-white/40"
      >
        <p>
          50 founders will be selected for early access.
          <span className="text-white/70"> Applications close soon.</span>
        </p>
      </motion.div>
    </div>
  )
}
