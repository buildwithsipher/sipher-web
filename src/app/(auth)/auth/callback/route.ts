import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { checkRateLimit } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit'
import { logWarn, logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/waitlist/complete'

  // Professional debugging: Log all callback parameters
  console.log('[OAuth Callback] Request received', {
    url: requestUrl.toString(),
    hasCode: !!code,
    hasError: !!error,
    error,
    errorDescription,
    next,
    origin: requestUrl.origin,
    pathname: requestUrl.pathname,
    searchParams: Object.fromEntries(requestUrl.searchParams.entries()),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlDomain: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
        : 'missing',
    },
  })

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

  // Handle OAuth errors from Supabase/Google
  if (error) {
    logError('OAuth callback error from provider', new Error(errorDescription || error), {
      error,
      errorDescription,
      url: requestUrl.toString(),
      action: 'oauth_provider_error',
    })
    console.error('[OAuth Callback] Provider error:', {
      error,
      errorDescription,
      fullUrl: requestUrl.toString(),
    })

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

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logError('Missing Supabase environment variables', new Error('Missing env vars'), {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        action: 'oauth_env_check',
      })
      const errorUrl = new URL(
        '/?error=auth-failed&message=' +
          encodeURIComponent('Server configuration error. Please contact support.'),
        request.url
      )
      return NextResponse.redirect(errorUrl)
    }

    console.log('[OAuth Callback] Exchanging code for session...', {
      codeLength: code?.length,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    })

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      logError('Failed to exchange code for session', error, {
        errorCode: error.status,
        errorMessage: error.message,
        codeLength: code?.length,
        action: 'oauth_code_exchange_failed',
      })
      console.error('[OAuth Callback] Code exchange error:', {
        error: error.message,
        status: error.status,
        name: error.name,
      })
    }

    if (!error && sessionData?.session) {
      console.log('[OAuth Callback] Session created successfully', {
        userId: sessionData.session.user?.id,
        email: sessionData.session.user?.email,
        hasUser: !!sessionData.session.user,
      })
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
      // Code exchange failed - provide detailed error
      const errorDetails = error
        ? `Error: ${error.message} (Status: ${error.status || 'unknown'})`
        : 'Unknown error during authentication'

      logError('Auth callback failed - no session created', error || new Error('Unknown error'), {
        errorDetails,
        hasCode: !!code,
        codeLength: code?.length,
        action: 'oauth_session_creation_failed',
      })

      console.error('[OAuth Callback] Failed to create session:', {
        error: error?.message,
        status: error?.status,
        hasCode: !!code,
        codeLength: code?.length,
      })

      // Return the user to an error page with instructions
      // IMPORTANT: Always use request.url origin to preserve localhost in development
      const errorUrl = new URL(
        '/?error=auth-failed&message=' +
          encodeURIComponent(
            'Failed to complete authentication. This may be due to:\n' +
              '1. Redirect URL mismatch in Supabase settings\n' +
              '2. Expired or invalid authorization code\n' +
              '3. Network connectivity issues\n\n' +
              'Please try again or contact support.'
          ),
        request.url
      )
      console.error('[OAuth Callback] Redirecting to error page:', errorUrl.toString())
      return NextResponse.redirect(errorUrl)
    }
  }

  // No code parameter - this shouldn't happen if OAuth flow is correct
  console.warn('[OAuth Callback] No code parameter in callback URL', {
    url: requestUrl.toString(),
    searchParams: Object.fromEntries(requestUrl.searchParams.entries()),
  })
  logWarn('OAuth callback missing code parameter', {
    url: requestUrl.toString(),
    action: 'oauth_missing_code',
  })

  // Redirect to home with error
  // IMPORTANT: Always use request.url origin to preserve localhost in development
  const errorUrl = new URL(
    '/?error=auth-failed&message=' +
      encodeURIComponent('Invalid authentication request. Please try signing in again.'),
    request.url
  )
  console.warn('[OAuth Callback] Redirecting to error page (no code):', errorUrl.toString())
  return NextResponse.redirect(errorUrl)
}
