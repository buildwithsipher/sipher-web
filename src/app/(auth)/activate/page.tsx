'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function ActivateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [loading, setLoading] = useState(false)

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token.trim()) {
      toast.error('Please enter your activation token')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Activation failed')
      }

      if (data.magicLink) {
        // Redirect to magic link for automatic login
        window.location.href = data.magicLink
      } else if (data.redirect) {
        router.push(data.redirect)
      } else {
        toast.success('Account activated! Please sign in.')
        router.push('/')
      }
    } catch (error: any) {
      console.error('Activation error:', error)
      toast.error(error.message || 'Failed to activate account. Please check your token and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Activate Your Account</h1>
            <p className="text-white/60">
              Enter your activation token to get started
            </p>
          </div>

          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <Label htmlFor="token" className="text-white/80">
                Activation Token
              </Label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your activation token"
                className="mt-2 bg-white/5 border-white/10 text-white"
                disabled={loading}
                autoFocus
              />
              <p className="mt-2 text-xs text-white/40">
                Find your activation token in the email we sent you
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                'Activate Account'
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    }>
      <ActivateForm />
    </Suspense>
  )
}

