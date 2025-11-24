import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { checkRateLimit } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit'
import { logWarn } from '@/lib/logger'

export async function GET(request: NextRequest) {
  // Rate limiting: Max 20 OAuth callbacks per IP per hour
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const rateLimit = checkRateLimit(`oauth-callback:${clientIp}`, 20, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    logWarn('OAuth callback rate limit exceeded', {
      ip: clientIp,
      action: 'oauth_callback_rate_limit',
    })
    return NextResponse.redirect(new URL('/?error=too-many-requests', request.url))
  }

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
      const errorUrl = new URL(
        '/?error=database-error&message=' +
          encodeURIComponent(
            'Unable to create account. This is usually caused by Supabase email confirmation settings. Please contact support or try again later.'
          ),
        request.url
      )
      return NextResponse.redirect(errorUrl)
    }

    // Generic OAuth error
    const errorUrl = new URL(
      '/?error=auth-failed&message=' +
        encodeURIComponent(errorDescription || 'Authentication failed'),
      request.url
    )
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
        // Add artificial delay to prevent email enumeration
        const delay = 200 + Math.random() * 100
        await new Promise(resolve => setTimeout(resolve, delay))

        // Check if user is already in waitlist
        const { data: waitlistUser } = await supabase
          .from('waitlist_users')
          .select('id, status')
          .eq('email', user.email)
          .single()

        if (waitlistUser) {
          // Audit log OAuth login
          auditLog(
            'oauth_login',
            user.id,
            {
              waitlistStatus: waitlistUser.status,
              action: 'oauth_callback',
            },
            {
              ip: clientIp,
              userAgent: request.headers.get('user-agent') || undefined,
            }
          )

          // Check user status
          if (waitlistUser.status === 'approved' || waitlistUser.status === 'activated') {
            // Check if onboarding is complete
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_done')
              .eq('id', user.id)
              .single()

            if (!profile?.onboarding_done) {
              // Not completed onboarding → redirect to onboarding
              const onboardingUrl = new URL('/onboarding/welcome', request.url)
              response = NextResponse.redirect(onboardingUrl)
            } else {
              // Completed onboarding → redirect to main dashboard
              const dashboardUrl = new URL('/dashboard', request.url)
              response = NextResponse.redirect(dashboardUrl)
            }
          } else {
            // Pending user → redirect to waitlist dashboard
            const dashboardUrl = new URL('/waitlist/dashboard', request.url)
            response = NextResponse.redirect(dashboardUrl)
          }
          // Ensure all cookies are copied
          request.cookies.getAll().forEach(cookie => {
            response.cookies.set(cookie.name, cookie.value)
          })
          return response
        }
      }

      // New user, redirect to minimal onboarding
      const onboardingUrl = new URL('/waitlist/onboarding', request.url)
      response = NextResponse.redirect(onboardingUrl)
      // Ensure all cookies are copied
      request.cookies.getAll().forEach(cookie => {
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
