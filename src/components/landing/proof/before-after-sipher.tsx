'use client'

import { motion } from 'framer-motion'

export default function BeforeAfterSipher() {
  return (
    <section className="mt-24 max-w-5xl mx-auto px-4 sm:px-6">
      {/* HEADER */}
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-bold text-white">Before → After Sipher</h3>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Same execution. Different visibility. Completely different outcomes.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BEFORE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl"
        >
          {/* Dim pulse bar */}
          <div className="h-[3px] w-full bg-white/[0.15] rounded-full mb-5" />

          <h4 className="text-xl font-semibold text-red-300">Before</h4>
          <ul className="mt-5 space-y-3 text-muted-foreground">
            <li>• No visible execution trail</li>
            <li>• Everything shipped, nothing documented</li>
            <li>• Cold emails ignored</li>
            <li>• Hard to build trust with VCs</li>
            <li>• Execution stays invisible</li>
            <li>• No surface area for opportunities</li>
          </ul>
        </motion.div>

        {/* AFTER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative bg-white/[0.05] border border-white/[0.12] rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_25px_rgba(140,80,255,0.25)]"
        >
          {/* Pulse Bar */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-[3px] w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-5"
          />

          <h4 className="text-xl font-semibold text-purple-300">After</h4>
          <ul className="mt-5 space-y-3 text-purple-200">
            <li>• Daily execution becomes visible proof</li>
            <li>• Every log builds your ProofCard</li>
            <li>• VCs discover you — not the other way</li>
            <li>• Trust builds automatically</li>
            <li>• Your consistency becomes your identity</li>
            <li>• Opportunities come inbound</li>
          </ul>
        </motion.div>
      </div>

      {/* FOOTER TEXT */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        This is a preview of how visibility transforms a founder's journey.
      </p>
    </section>
  )
}
