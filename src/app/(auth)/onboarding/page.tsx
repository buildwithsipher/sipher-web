'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()

  async function handleGoogleLogin() {
    try {
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

      if (error) {
        console.error('Google login error:', error.message)
        alert('Login failed. Please try again.')
      } else if (data?.url) {
        // Redirect to Google OAuth
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Unexpected login error:', err)
    }
  }

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user?.email) {
        // Check if user is in waitlist - handle errors gracefully
        try {
          const { data: waitlistUser, error } = await supabase
            .from('waitlist_users')
            .select('id')
            .eq('email', session.user.email)
            .maybeSingle()

          // If we got data, user exists in waitlist
          if (waitlistUser && !error) {
            router.push('/waitlist/dashboard')
          } else {
            // User not in waitlist or error occurred → redirect to complete onboarding
            router.push('/waitlist/complete')
          }
        } catch (error) {
          // On error, redirect to complete onboarding as fallback
          console.error('Error checking waitlist status:', error)
          router.push('/waitlist/complete')
        }
      }
    }

    checkSession()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B0C] text-white">
      <h1 className="text-5xl font-bold mb-6">
        Welcome to Sipher<span className="text-[#7B5CFF]">*</span>
      </h1>
      <p className="text-white/60 mb-10 max-w-md text-center">
        Sign in to access your Founder Dashboard and start building your ProofCard.
      </p>

      <button
        onClick={handleGoogleLogin}
        className="bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] hover:shadow-[0_0_30px_rgba(123,92,255,0.4)] px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-sm text-white/40">
        By signing in, you agree to our{' '}
        <a
          href="/terms"
          className="underline text-[#7B5CFF] hover:text-[#4AA8FF] transition-colors"
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          href="/privacy"
          className="underline text-[#7B5CFF] hover:text-[#4AA8FF] transition-colors"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
