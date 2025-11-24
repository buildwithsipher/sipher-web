'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export default function OnboardingWelcomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [waitlistUser, setWaitlistUser] = useState<any>(null)

  useEffect(() => {
    async function checkAuth() {
      // Use server-side verification API
      try {
        const response = await fetch('/api/onboarding/verify-access')
        const data = await response.json()

        if (!response.ok || !data.hasAccess) {
          // Redirect based on reason
          if (data.redirect) {
            router.push(data.redirect)
          } else {
            router.push('/?error=not-authorized')
          }
          return
        }

        // If access granted, fetch user data for the flow
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/?error=not-authenticated')
          return
        }

        setUser(authUser)

        // Fetch waitlist user data
        const { data: waitlistData } = await supabase
          .from('waitlist_users')
          .select('*')
          .eq('email', authUser.email)
          .single()

        if (!waitlistData) {
          router.push('/?error=waitlist-entry-not-found')
          return
        }

        setWaitlistUser(waitlistData)
        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/?error=auth-check-failed')
      }
    }

    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  if (!user || !waitlistUser) {
    return null
  }

  return <OnboardingFlow user={user} waitlistUser={waitlistUser} />
}
