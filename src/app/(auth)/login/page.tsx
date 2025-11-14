'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Login — Sipher'
  }, [])

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/waitlist/complete`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })
    if (error) {
      console.error('Google login error:', error.message)
    } else if (data?.url) {
      // Redirect to Google OAuth
      window.location.href = data.url
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Welcome to Sipher</h1>
      <p className="text-gray-400 mb-8">
        Where founders prove credibility through execution — not pedigree.
      </p>

      <button
        onClick={handleGoogleLogin}
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
      >
        Continue with Google
      </button>

      <p className="text-gray-500 text-sm mt-6">
        By continuing, you agree to Sipher’s Terms of Service & Privacy Policy.
      </p>
    </div>
  )
}