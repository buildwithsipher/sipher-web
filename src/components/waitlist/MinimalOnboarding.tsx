'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/logo'
import { trackWaitlistSignup, trackFormStart } from '@/lib/analytics/posthog'
import { track } from '@vercel/analytics'

type Step = 'google' | 'domain' | 'stage' | 'details' | 'success'

const DOMAINS = [
  { id: 'saas', label: 'SaaS', icon: '💼' },
  { id: 'ai-ml', label: 'AI/ML', icon: '🤖' },
  { id: 'consumer', label: 'Consumer', icon: '📱' },
  { id: 'fintech', label: 'FinTech', icon: '💳' },
  { id: 'edtech', label: 'EdTech', icon: '📚' },
  { id: 'other', label: 'Other', icon: '🚀' },
]

const STAGES = [
  { 
    id: 'idea', 
    label: 'Idea Stage', 
    description: 'Just starting, validating, exploring',
    icon: '🔥'
  },
  { 
    id: 'mvp', 
    label: 'Building MVP', 
    description: 'Actively shipping core product',
    icon: '🚀'
  },
  { 
    id: 'launched', 
    label: 'Launched', 
    description: 'Product live, early users',
    icon: '⚡'
  },
  { 
    id: 'revenue', 
    label: 'Early Revenue', 
    description: 'Paying users/traction',
    icon: '💰'
  },
  { 
    id: 'scaling', 
    label: 'Scaling', 
    description: 'Growth engine, team expansion',
    icon: '📈'
  },
]

const TOP_CITIES = [
  'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Other'
]

export default function MinimalOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('google')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [waitlistCount, setWaitlistCount] = useState(0)
  
  const [formData, setFormData] = useState({
    domain: '',
    stage: '',
    name: '',
    startupName: '',
    city: '',
  })

  // Track form start
  useEffect(() => {
    trackFormStart('waitlist')
  }, [])

  // Fetch waitlist count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/waitlist/count')
        if (response.ok) {
          const data = await response.json()
          setWaitlistCount(data.count || 0)
        }
      } catch (error) {
        console.error('Failed to fetch waitlist count:', error)
      }
    }
    fetchCount()
  }, [])

  // Check if user is already signed in
  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        // Pre-fill name from Google
        if (session.user.user_metadata?.full_name) {
          setFormData(prev => ({ ...prev, name: session.user.user_metadata.full_name }))
        }
        // Check if already in waitlist
        const { data: existing } = await supabase
          .from('waitlist_users')
          .select('id')
          .eq('email', session.user.email)
          .single()
        
        if (existing) {
          router.push('/waitlist/dashboard')
          return
        }
        // User signed in but not in waitlist → go to domain step
        setStep('domain')
      }
    }
    checkUser()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/waitlist/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 'google') {
      // After Google sign in, move to domain
      setStep('domain')
    } else if (step === 'domain') {
      if (!formData.domain) {
        toast.error('Please select what you\'re building')
        return
      }
      setStep('stage')
    } else if (step === 'stage') {
      if (!formData.stage) {
        toast.error('Please select your journey stage')
        return
      }
      setStep('details')
    } else if (step === 'details') {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.startupName || !formData.city) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        toast.error('Please sign in first')
        setLoading(false)
        return
      }

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: formData.name,
          startupName: formData.startupName,
          startupStage: formData.stage,
          city: formData.city,
          linkedinUrl: '',
          websiteUrl: '',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join waitlist')
      }

      // Track successful signup
      trackWaitlistSignup({
        startup_stage: formData.stage,
        city: formData.city,
        startup_name: formData.startupName,
      })
      track('waitlist_signup', {
        stage: formData.stage,
        city: formData.city,
      })

      setStep('success')
    } catch (error: any) {
      console.error('Submission error:', error)
      toast.error(error.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const displayedCount = waitlistCount + 100

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Screen 1: Google 1-Tap */}
          {step === 'google' && (
            <motion.div
              key="google"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <Logo size="large" />
                <p className="text-white/60 text-sm">
                  "Where founders turn execution → proof"
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs text-purple-400">
                    {displayedCount > 100 ? `${displayedCount.toLocaleString()}+` : '100+'} founders are building already
                  </span>
                </div>
              </div>

              <div className="space-y-6 pt-8">
                <div>
                  <h1 className="text-2xl font-light text-white mb-2">
                    👋 Join the Waitlist
                  </h1>
                </div>

                <motion.button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-white text-[#0D0D0D] rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-white/40">
                  No spam. 1-click. Takes 5 seconds.
                </p>
              </div>

              <div className="pt-8 text-xs text-white/30 space-x-4">
                <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
                <span>•</span>
                <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
              </div>
            </motion.div>
          )}

          {/* Screen 2: Domain Selection */}
          {step === 'domain' && (
            <motion.div
              key="domain"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>

              <div>
                <h1 className="text-2xl font-light text-white mb-1">
                  ✦ Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
                </h1>
                <p className="text-white/60 text-sm">Let's learn what you're building.</p>
              </div>

              <div>
                <p className="text-sm text-white/80 mb-4">1️⃣ What are you building?</p>
                <div className="grid grid-cols-2 gap-3">
                  {DOMAINS.map((domain) => (
                    <motion.button
                      key={domain.id}
                      onClick={() => setFormData(prev => ({ ...prev, domain: domain.id }))}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        formData.domain === domain.id
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-1">{domain.icon}</div>
                      <div className="text-sm font-medium text-white">{domain.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={handleNext}
                disabled={!formData.domain}
                className="w-full px-6 py-4 bg-white text-[#0D0D0D] rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: formData.domain ? 1.02 : 1 }}
                whileTap={{ scale: formData.domain ? 0.98 : 1 }}
              >
                Next →
              </motion.button>
            </motion.div>
          )}

          {/* Screen 3: Stage Selection */}
          {step === 'stage' && (
            <motion.div
              key="stage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>

              <div>
                <h2 className="text-xl font-light text-white mb-4">
                  Where are you in the journey?
                </h2>
                <div className="space-y-3">
                  {STAGES.map((stage) => (
                    <motion.button
                      key={stage.id}
                      onClick={() => setFormData(prev => ({ ...prev, stage: stage.id }))}
                      className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        formData.stage === stage.id
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{stage.icon}</span>
                        <div className="flex-1">
                          <div className="text-base font-medium text-white mb-1">
                            {stage.label}
                          </div>
                          <div className="text-xs text-white/60">
                            {stage.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep('domain')}
                  className="flex-1 px-6 py-4 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={!formData.stage}
                  className="flex-1 px-6 py-4 bg-white text-[#0D0D0D] rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: formData.stage ? 1.02 : 1 }}
                  whileTap={{ scale: formData.stage ? 0.98 : 1 }}
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Screen 4: Final Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="w-2 h-2 rounded-full bg-purple-400" />
              </div>

              <div>
                <h2 className="text-xl font-light text-white mb-2">
                  Last step, we'll personalize your profile.
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Your name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Srideep Goud"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Your startup name</label>
                  <input
                    type="text"
                    value={formData.startupName}
                    onChange={(e) => setFormData(prev => ({ ...prev, startupName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Sipher"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-colors"
                  >
                    <option value="" className="bg-[#0D0D0D]">Select city</option>
                    {TOP_CITIES.map((city) => (
                      <option key={city} value={city} className="bg-[#0D0D0D]">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep('stage')}
                  className="flex-1 px-6 py-4 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={loading || !formData.name || !formData.startupName || !formData.city}
                  className="flex-1 px-6 py-4 bg-white text-[#0D0D0D] rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: !loading && formData.name && formData.startupName && formData.city ? 1.02 : 1 }}
                  whileTap={{ scale: !loading && formData.name && formData.startupName && formData.city ? 0.98 : 1 }}
                >
                  {loading ? 'Submitting...' : 'Finish →'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Screen 5: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-6xl mb-4"
              >
                ✦
              </motion.div>

              <div>
                <h1 className="text-3xl font-light text-white mb-2">
                  You're on the list{formData.name ? `, ${formData.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-white/60 text-sm mt-4">
                  Your Sipher profile is being prepared.
                  <br />
                  We'll notify you when your cohort opens.
                </p>
              </div>

              <motion.button
                onClick={() => router.push('/waitlist/dashboard')}
                className="w-full px-6 py-4 bg-white text-[#0D0D0D] rounded-xl font-medium hover:bg-gray-100 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Waitlist Dashboard
              </motion.button>

              <p className="text-xs text-white/40 pt-4">
                Want early access? Invite 3 founders → get instant approval.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

