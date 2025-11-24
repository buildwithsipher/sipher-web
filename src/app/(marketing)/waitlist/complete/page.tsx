'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, MapPin, Briefcase, TrendingUp, Linkedin, Link as LinkIcon, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/logo'

export default function WaitlistCompletePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    startupName: '',
    startupStage: '',
    linkedinUrl: '',
    city: '',
    whatBuilding: '',
    websiteUrl: '',
  })

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      
      // Try getSession first (uses cookies), then getUser as fallback
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        
        // Pre-fill name from Google OAuth
        if (session.user.user_metadata?.full_name) {
          setFormData(prev => ({ ...prev, name: session.user.user_metadata.full_name }))
        }
        return
      }
      
      // If no session, try getUser (might work if cookies are still propagating)
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user && !error) {
        setUser(user)
        
        // Pre-fill name from Google OAuth
        if (user.user_metadata?.full_name) {
          setFormData(prev => ({ ...prev, name: user.user_metadata.full_name }))
        }
        return
      }
      
      // If still no user, wait a bit and try again (cookies might be propagating)
      setTimeout(async () => {
        const { data: { user: retryUser } } = await supabase.auth.getUser()
        if (retryUser) {
          setUser(retryUser)
          if (retryUser.user_metadata?.full_name) {
            setFormData(prev => ({ ...prev, name: retryUser.user_metadata.full_name }))
          }
        } else {
          // Still no user after retry, redirect to home
          router.push('/')
        }
      }, 500)
    }
    getUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) {
        toast.error('Please sign in first')
        router.push('/')
        return
      }

      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Full name is required')
        setLoading(false)
        return
      }

      if (!formData.startupName.trim()) {
        toast.error('Startup name is required')
        setLoading(false)
        return
      }

      if (!formData.startupStage) {
        toast.error('Startup stage is required')
        setLoading(false)
        return
      }

      if (!formData.city.trim()) {
        toast.error('City is required')
        setLoading(false)
        return
      }

      // Validate LinkedIn URL if provided
      if (formData.linkedinUrl && formData.linkedinUrl.trim()) {
        try {
          new URL(formData.linkedinUrl)
        } catch {
          toast.error('Please enter a valid LinkedIn URL')
          setLoading(false)
          return
        }
      }

      // Validate website URL if provided
      if (formData.websiteUrl && formData.websiteUrl.trim()) {
        try {
          new URL(formData.websiteUrl)
        } catch {
          toast.error('Please enter a valid website URL')
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: formData.name,
          startupName: formData.startupName,
          startupStage: formData.startupStage,
          linkedinUrl: formData.linkedinUrl && formData.linkedinUrl.trim() ? formData.linkedinUrl.trim() : '',
          city: formData.city,
          whatBuilding: formData.whatBuilding,
          websiteUrl: formData.websiteUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join waitlist')
      }

      // Track successful waitlist signup with complete data
      const { trackWaitlistSignup } = await import('@/lib/analytics/posthog')
      const { track } = await import('@vercel/analytics')
      
      trackWaitlistSignup({
        startup_stage: formData.startupStage,
        city: formData.city,
        startup_name: formData.startupName,
      })
      track('waitlist_signup', {
        stage: formData.startupStage,
        city: formData.city,
      })

      // Redirect to waitlist dashboard
      router.push('/waitlist/dashboard')
    } catch (error: any) {
      console.error('Submission error:', error)
      toast.error(error.message || 'Something went wrong')
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B0B0C]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="medium" animated={false} />
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl font-black mb-2 text-white">Enter Waitlist</h1>
          <p className="text-white/60 mb-8">
            Complete your profile to join. This takes 20-30 seconds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name - Required */}
            <div>
              <Label htmlFor="name" className="text-white/70 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your full name"
                disabled={loading}
                required
                autoComplete="name"
                inputMode="text"
                className="mt-2 bg-white/10 border-white/20 min-h-[44px] text-base"
              />
            </div>

            {/* Startup Name - Required */}
            <div>
              <Label htmlFor="startupName" className="text-white/70 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Startup Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="startupName"
                value={formData.startupName}
                onChange={(e) =>
                  setFormData({ ...formData, startupName: e.target.value })
                }
                placeholder="e.g., Sipher"
                disabled={loading}
                required
                autoComplete="organization"
                inputMode="text"
                className="mt-2 bg-white/10 border-white/20 min-h-[44px] text-base"
              />
            </div>

            {/* Startup Stage - Required */}
            <div>
              <Label htmlFor="startupStage" className="text-white/70 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Startup Stage <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.startupStage}
                onValueChange={(value) =>
                  setFormData({ ...formData, startupStage: value })
                }
                disabled={loading}
                required
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="mvp">MVP</SelectItem>
                  <SelectItem value="launched">Live Product</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City - Required */}
            <div>
              <Label htmlFor="city" className="text-white/70 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                City <span className="text-red-400">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="e.g., Bangalore"
                disabled={loading}
                required
                autoComplete="address-level2"
                inputMode="text"
                className="mt-2 bg-white/10 border-white/20 min-h-[44px] text-base"
              />
            </div>

            {/* LinkedIn URL - Optional */}
            <div>
              <Label htmlFor="linkedinUrl" className="text-white/70 flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn Profile URL <span className="text-white/40 text-sm">(Optional)</span>
              </Label>
              <Input
                id="linkedinUrl"
                type="text"
                value={formData.linkedinUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinUrl: e.target.value })
                }
                placeholder="linkedin.com/in/yourprofile"
                disabled={loading}
                autoComplete="url"
                inputMode="url"
                className="mt-2 bg-white/10 border-white/20 min-h-[44px] text-base"
              />
            </div>

            {/* What Building - Optional */}
            <div>
              <Label htmlFor="whatBuilding" className="text-white/70 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                What are you building? <span className="text-white/40 text-sm">(Optional)</span>
              </Label>
              <Input
                id="whatBuilding"
                value={formData.whatBuilding}
                onChange={(e) =>
                  setFormData({ ...formData, whatBuilding: e.target.value })
                }
                placeholder="One-liner about your startup"
                disabled={loading}
                inputMode="text"
                maxLength={500}
                className="mt-2 bg-white/10 border-white/20 min-h-[44px] text-base"
              />
            </div>

            {/* Website URL - Optional */}
            <div>
              <Label htmlFor="websiteUrl" className="text-white/70 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Website / Product Link <span className="text-white/40 text-sm">(Optional)</span>
              </Label>
              <Input
                id="websiteUrl"
                type="text"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                placeholder="yourproduct.com"
                disabled={loading}
                autoComplete="url"
                inputMode="url"
                className="mt-2 bg-white/10 border-white/20 min-h-[44px] text-base"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entering Waitlist...
                </>
              ) : (
                'Enter Waitlist →'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
