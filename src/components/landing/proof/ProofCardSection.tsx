"use client";

import { motion } from "framer-motion";
import BeforeAfterSipher from "@/components/landing/proof/before-after-sipher";
import SipherAsterisk from "@/components/ui/SipherAsterisk";

interface ProofCardProps {
  category: string;
  bullets: string[];
  momentum: string;
  score: string;
}

export default function ProofCardSection() {
  const proofCards: ProofCardProps[] = [
    {
      category: "Product Work",
      bullets: [
        "Shipped onboarding revamp",
        "Fixed checkout flow",
        "Improved load speed",
      ],
      momentum: "+14%",
      score: "82/100",
    },
    {
      category: "Customer Growth",
      bullets: [
        "Closed 3 new customers",
        "Ran 12 user interviews",
        "Responded to 27 tickets",
      ],
      momentum: "+10%",
      score: "78/100",
    },
    {
      category: "Business Execution",
      bullets: [
        "Drafted pricing v2",
        "Built outreach list (22 leads)",
        "Refined ICP insights",
      ],
      momentum: "+9%",
      score: "80/100",
    },
    {
      category: "Momentum Metrics",
      bullets: [
        "+14% weekly activation",
        "MRR ↑ ₹18K",
        "Retention 62% → 71%",
      ],
      momentum: "Stable",
      score: "84/100",
    },
    {
      category: "Founder Journey",
      bullets: [
        "7-day streak",
        "23 logged actions",
        "3 weekly milestones hit",
      ],
      momentum: "High",
      score: "82/100",
    },
    {
      category: "Content & Community",
      bullets: [
        "Recorded feature demo",
        "Published launch trailer",
        "Hosted feedback call with 14 users",
      ],
      momentum: "Growing",
      score: "79/100",
    },
  ];

  return (
    <section className="py-24">

      {/* ========================================= */}
      {/* HEADER NARRATION */}
      {/* ========================================= */}
      <div className="text-center mb-16 px-4 sm:px-6">
        <h2 className="text-4xl md:text-5xl font-black text-white">
          See The Proof
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Visualize how your daily execution becomes your credential — whether you're
          building SaaS, D2C, AI, services, or community-led startups.
        </p>
      </div>

      {/* ========================================= */}
      {/* PROOF CARD GRID */}
      {/* ========================================= */}
      <div className="px-4 sm:px-6">
        <div className="text-center mb-10">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Founder Execution Profiles (Preview)
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Anonymous previews of how founders log execution on Sipher — universal, non-technical, not real user data.
          </p>
        </div>

        {/* Proof Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {proofCards.map((card, index) => (
            <ProofCard
              key={index}
              category={card.category}
              bullets={card.bullets}
              momentum={card.momentum}
              score={card.score}
              index={index}
            />
          ))}
        </div>

        {/* Footer Text */}
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
          These are preview ProofCards — anonymized, universal, non-personal.
        </p>
      </div>

      {/* ========================================= */}
      {/* PROOFCARD DEMO */}
      {/* ========================================= */}

      <div className="mt-24 text-center px-4 sm:px-6">
        <h3 className="text-3xl md:text-4xl font-bold text-white">
          Your ProofCard
        </h3>
        <p className="mt-2 text-muted-foreground">
          A real-time score generated automatically from your execution logs.
        </p>
      </div>

      <div className="mt-12 max-w-4xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">

          <div className="text-center md:text-left mb-8 md:mb-0">
            <div className="text-6xl font-black text-purple-400">85/100</div>
            <div className="mt-2 text-muted-foreground">Execution Score</div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-white">
            <Metric label="Consistency" value="82" />
            <Metric label="Velocity" value="91" />
            <Metric label="Engagement" value="78" />
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* ACTIVITY FEED */}
      {/* ========================================= */}

      <div className="mt-20 max-w-3xl mx-auto px-4 sm:px-6">
        <h4 className="text-2xl font-semibold text-white mb-6">Recent Activity</h4>

        <Activity title="Shipped onboarding revamp" time="Today" score="+12" />
        <Activity title="Closed 3 paid customers" time="Yesterday" score="+10" />
        <Activity title="Ran 12 user interviews" time="2 days ago" score="+15" />
        <Activity title="Drafted pricing v2" time="3 days ago" score="+8" />
      </div>

      {/* ========================================= */}
      {/* BEFORE → AFTER SIPHER (Cinematic) */}
      {/* ========================================= */}

      <BeforeAfterSipher />

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mt-16 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openWaitlist'));
            }}
            className="px-6 py-3 bg-white text-[#0b0b0c] text-sm font-semibold rounded-lg transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Start tracking your execution by joining the waitlist"
          >
            Start Tracking Your Execution
          </button>
          <p className="text-xs text-white/40">
            247+ founders already building their ProofCard
          </p>
        </div>
      </motion.div>
    </section>
  );
}

/* ============================== */
/* PROOF CARD COMPONENT           */
/* ============================== */

function ProofCard({ category, bullets, momentum, score, index }: ProofCardProps & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl overflow-hidden group"
      whileHover={{
        boxShadow: "0 0 20px rgba(120, 80, 255, 0.15)",
        borderColor: "rgba(255, 255, 255, 0.15)",
      }}
    >
      {/* Pulse Line (Top Identity Bar) */}
      <motion.div 
        className="h-[2px] bg-gradient-to-r from-purple-500/70 to-indigo-500/70"
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Card Content */}
      <div className="p-6">
        {/* Avatar + Category Title */}
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar Silhouette (Anonymous) */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400/20 to-transparent flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-400/20" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">{category}</h4>
          </div>
        </div>

        {/* Execution Bullets */}
        <ul className="space-y-2 mb-4">
          {bullets.map((bullet, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
              <SipherAsterisk size={12} color="currentColor" className="text-indigo-400 opacity-70" ariaHidden={true} />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="h-px bg-white/5 my-4" />

        {/* Momentum Block */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SipherAsterisk size={12} color="currentColor" className="text-indigo-400" ariaHidden={true} />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Momentum</span>
          </div>
          <span className="text-sm font-semibold text-purple-300">{momentum}</span>
        </div>

        {/* Score Preview (Tiny, Not Dominant) */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-muted-foreground">Score preview</span>
          <span className="text-xs font-medium text-white/60">{score}</span>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0" />
      </div>
    </motion.div>
  );
}

/* ============================== */
/* REUSABLE COMPONENTS            */
/* ============================== */

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-purple-300">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Activity({ title, time, score }: { title: string; time: string; score: string }) {
  return (
    <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl mb-3 backdrop-blur">
      <div className="text-white">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{time}</div>
      </div>
      <div className="text-purple-300 text-sm font-bold">{score}</div>
    </div>
  );
}
