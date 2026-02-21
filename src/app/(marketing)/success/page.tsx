'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Share2 } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [position, setPosition] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    setPosition(searchParams.get('position'))
    setReferralCode(searchParams.get('code'))
  }, [searchParams])

  const referralUrl = referralCode ? `${window.location.origin}?ref=${referralCode}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl)
    toast.success('Referral link copied!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Sipher Waitlist',
          text: `I just joined Sipher - where execution becomes credential. Join me!`,
          url: referralUrl,
        })
      } catch (error) {
        console.error('Share error:', error)
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="medium" animated />
        </div>

        {/* Success Card */}
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-purple-500" />
            </div>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">You&apos;re in! 🎉</h1>

          <p className="text-xl text-muted-foreground mb-6">
            You&apos;re <span className="text-purple-400 font-bold">#{position}</span> on the
            waitlist
          </p>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-4">
              <strong className="text-foreground">Launch date:</strong> February 1, 2026
              <br />
              <strong className="text-foreground">Early access:</strong> First 50 founders
            </p>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Your referral link:</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-background rounded-lg px-4 py-3 text-sm font-mono text-purple-400 truncate">
                  {referralUrl}
                </div>
                <Button onClick={handleCopy} variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Move up the list:</h3>
            <p className="text-muted-foreground text-sm">
              Share Sipher with other founders. Every signup with your code moves you up.
            </p>

            <Button onClick={handleShare} size="lg" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share Sipher
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Check your email for confirmation and updates.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Logo size="medium" animated={false} />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
