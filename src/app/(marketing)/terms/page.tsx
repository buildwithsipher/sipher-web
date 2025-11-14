"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export default function TermsPage() {
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
            Terms of Service
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
              <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
              <p className="text-white/70 leading-relaxed">
                By accessing or using Sipher, you agree to be bound by these Terms of Service. 
                If you disagree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Permission is granted to temporarily use Sipher for personal, non-commercial use only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Content</h2>
              <p className="text-white/70 leading-relaxed">
                You retain ownership of any content you submit to Sipher. By submitting content, 
                you grant us a license to use, display, and distribute your content on the platform 
                for the purpose of providing our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Privacy</h2>
              <p className="text-white/70 leading-relaxed">
                Your use of Sipher is also governed by our Privacy Policy. Please review our 
                <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                  {" "}Privacy Policy
                </Link> to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
              <p className="text-white/70 leading-relaxed">
                In no event shall Sipher or its suppliers be liable for any damages arising out 
                of the use or inability to use Sipher, even if Sipher has been notified of the 
                possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Contact Information</h2>
              <p className="text-white/70 leading-relaxed">
                If you have any questions about these Terms, please contact us at{" "}
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

