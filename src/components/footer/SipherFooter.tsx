'use client'

import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function SipherFooter() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()

    // Handle hash navigation
    if (href.startsWith('#')) {
      const targetId = href.slice(1)

      // Map footer links to tab IDs
      const tabMap: Record<string, string> = {
        problem: 'problem',
        solution: 'solution',
        'live-demo': 'playground',
        proof: 'proof',
        pulse: 'pulse',
        roadmap: 'roadmap',
        founder: 'letter',
      }

      const tabId = tabMap[targetId]

      if (tabId) {
        // Dispatch custom event to switch tab
        const event = new CustomEvent('switchTab', { detail: { tabId } })
        window.dispatchEvent(event)

        // Also scroll to top of main content
        const mainContent = document.querySelector('main')
        if (mainContent) {
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      } else {
        // Try to find element by ID for other sections
        const element = document.getElementById(targetId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    } else {
      window.location.href = href
    }
  }

  return (
    <footer className="relative w-full bg-[#0b0b0c] border-t border-white/10 pt-20 pb-10">
      {/* BRAND BLOCK */}
      <div className="text-center mb-10">
        {/* Logo */}
        <div className="mx-auto mb-4 opacity-90 flex justify-center">
          <Logo size="small" animated={false} />
        </div>

        <p className="text-white/50 text-sm mb-5">Where execution becomes credential.</p>

        {/* Pulse Line */}
        <div className="relative w-48 h-[1.5px] mx-auto mt-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-indigo-500/40 to-purple-500/40 animate-[pulseLine_6s_linear_infinite]" />
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex flex-wrap justify-center gap-6 text-sm mb-12 px-4">
        {[
          { label: 'Problem', href: '#problem' },
          { label: 'Solution', href: '#solution' },
          { label: 'Live Demo', href: '#live-demo' },
          { label: 'ProofCard', href: '#proof' },
          { label: 'Pulse', href: '#pulse' },
          { label: 'Roadmap', href: '#roadmap' },
          { label: 'Founder Letter', href: '#founder' },
        ].map(item => (
          <Link
            key={item.label}
            href={item.href}
            onClick={e => handleNavClick(e, item.href)}
            className="text-white/40 hover:text-white/80 transition-all duration-200 hover:drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* MAIN FOOTER GRID */}
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {/* Founder Block */}
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wide mb-2">Founder</p>
          <p className="text-white/80 font-medium mb-1">Srideep Goud</p>
          <a
            href="https://linkedin.com/in/srideep-goud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 text-sm hover:text-purple-400 hover:underline transition-colors duration-200"
          >
            LinkedIn
          </a>
        </div>

        {/* Legal */}
        <div className="md:text-center">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-2">Legal</p>
          <div className="space-y-1 text-sm">
            <Link
              href="/terms"
              className="text-white/30 hover:text-purple-300 transition-colors duration-200 block"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-white/30 hover:text-purple-300 transition-colors duration-200 block"
            >
              Privacy
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="md:text-right flex md:block justify-center">
          <Link
            href="#waitlist"
            onClick={e => {
              e.preventDefault()
              // Trigger waitlist modal - this will be handled by the landing page
              window.dispatchEvent(new CustomEvent('openWaitlist'))
            }}
            className="border border-white/10 text-purple-400 px-5 py-2 rounded-lg text-sm hover:border-purple-400/50 hover:text-purple-300 transition-all duration-200 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] inline-block"
          >
            Join Waitlist
          </Link>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT */}
      <div className="text-center text-white/30 text-xs mt-16">
        © 2025 Sipher. All rights reserved.
      </div>
    </footer>
  )
}
