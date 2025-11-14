"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex justify-center mb-8">
            <Logo size="medium" animated={false} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-center mb-4">
            Privacy Policy
          </h1>
          <p className="text-center text-white/60">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto prose prose-invert prose-lg"
        >
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
                <li>Name and email address</li>
                <li>Startup information (name, stage)</li>
                <li>LinkedIn profile URL (optional)</li>
                <li>Execution logs and ProofCard data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
                <li>Provide and improve our services</li>
                <li>Send you updates and notifications</li>
                <li>Display your ProofCard and execution data</li>
                <li>Facilitate connections between founders and investors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
              <p className="text-white/70 leading-relaxed">
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure, and we 
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Your Rights</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of certain communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
              <p className="text-white/70 leading-relaxed">
                We use cookies to enhance your experience, analyze usage, and assist in our 
                marketing efforts. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
              <p className="text-white/70 leading-relaxed">
                If you have questions about this Privacy Policy, contact us at{" "}
                <a href="mailto:hey@sipher.in" className="text-purple-400 hover:text-purple-300 underline">
                  hey@sipher.in
                </a>
              </p>
            </section>
          </div>

          {/* Back Link */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors underline"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

