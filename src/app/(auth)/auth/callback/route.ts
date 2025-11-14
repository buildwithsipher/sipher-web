import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/waitlist/complete'

  // Handle OAuth errors from Supabase
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    
    // If it's a database error saving new user, provide specific guidance
    if (error === 'server_error' && errorDescription?.includes('Database error saving new user')) {
      const errorUrl = new URL('/?error=database-error&message=' + encodeURIComponent('Unable to create account. This is usually caused by Supabase email confirmation settings. Please contact support or try again later.'), request.url)
      return NextResponse.redirect(errorUrl)
    }
    
    // Generic OAuth error
    const errorUrl = new URL('/?error=auth-failed&message=' + encodeURIComponent(errorDescription || 'Authentication failed'), request.url)
    return NextResponse.redirect(errorUrl)
  }

  // Create response object for cookie handling
  let response = NextResponse.redirect(new URL(next, request.url))

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.redirect(new URL(next, request.url))
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.redirect(new URL(next, request.url))
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData?.session) {
      // Get user email from session
      const user = sessionData.session.user

      if (user?.email) {
        // Check if user is already in waitlist
        const { data: waitlistUser } = await supabase
          .from('waitlist_users')
          .select('id, status')
          .eq('email', user.email)
          .single()

        if (waitlistUser) {
          // Check user status
          if (waitlistUser.status === 'approved' || waitlistUser.status === 'activated') {
            // Approved/activated user → redirect to main dashboard
            const dashboardUrl = new URL('/dashboard', request.url)
            response = NextResponse.redirect(dashboardUrl)
          } else {
            // Pending user → redirect to waitlist dashboard
            const dashboardUrl = new URL('/waitlist/dashboard', request.url)
            response = NextResponse.redirect(dashboardUrl)
          }
          // Ensure all cookies are copied
          request.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value)
          })
          return response
        }
      }

      // New user, redirect to onboarding
      const onboardingUrl = new URL('/waitlist/complete', request.url)
      response = NextResponse.redirect(onboardingUrl)
      // Ensure all cookies are copied
      request.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value)
      })
      return response
    } else {
      console.error('Auth callback error:', error)
      // Return the user to an error page with instructions
      const errorUrl = new URL('/?error=auth-failed', request.url)
      return NextResponse.redirect(errorUrl)
    }
  }

  // No code parameter, redirect to home
  return NextResponse.redirect(new URL('/', request.url))
}

