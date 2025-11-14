'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FocusTrap } from '@/components/ui/focus-trap'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WaitlistModalProps {
  onClose: () => void
}

export function WaitlistModal({ onClose }: WaitlistModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'auth' | 'details'>('auth')
  const [formData, setFormData] = useState({
    startupName: '',
    startupStage: '',
    linkedinUrl: '',
  })

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/waitlist/complete`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      // Store form data in localStorage for after OAuth redirect
      if (formData.startupName || formData.startupStage) {
        localStorage.setItem('waitlist_form_data', JSON.stringify(formData))
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in with Google first')
        setLoading(false)
        return
      }

      // Submit to waitlist API
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata.full_name || user.email?.split('@')[0],
          startupName: formData.startupName,
          startupStage: formData.startupStage,
          linkedinUrl: formData.linkedinUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join waitlist')
      }

      // Redirect to waitlist dashboard
      router.push('/waitlist/dashboard')
    } catch (error: any) {
      console.error('Submission error:', error)
      toast.error(error.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
        >
          <FocusTrap active={true} onEscape={onClose}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {step === 'auth' ? (
            <>
              <h2 id="waitlist-modal-title" className="text-2xl font-bold mb-2">Join the Waitlist</h2>
              <p className="text-muted-foreground mb-6">
                Be among the first 50 founders to prove execution over pedigree.
              </p>

              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 text-base"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Chrome className="w-5 h-5 mr-2" />
                    Continue with Google
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold mb-2">Tell us about your startup</h2>
              <p className="text-muted-foreground mb-6">
                This helps us curate the best cohort.
              </p>

              <div className="space-y-4">
                {/* Startup Name */}
                <div>
                  <Label htmlFor="startupName">
                    Startup Name <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="startupName"
                    value={formData.startupName}
                    onChange={(e) =>
                      setFormData({ ...formData, startupName: e.target.value })
                    }
                    placeholder="e.g., Sipher"
                    disabled={loading}
                  />
                </div>

                {/* Startup Stage */}
                <div>
                  <Label htmlFor="startupStage">
                    Stage <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Select
                    value={formData.startupStage}
                    onValueChange={(value) =>
                      setFormData({ ...formData, startupStage: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                      <SelectItem value="launched">Launched</SelectItem>
                      <SelectItem value="scaling">Scaling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* LinkedIn URL */}
                <div>
                  <Label htmlFor="linkedinUrl">
                    LinkedIn Profile <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedinUrl: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/yourprofile"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('auth')}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Waitlist →'
                  )}
                </Button>
              </div>
            </form>
          )}
          </FocusTrap>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

