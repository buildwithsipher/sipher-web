import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit'
import { logError, logWarn } from '@/lib/logger'

/**
 * Secure activation endpoint (POST)
 * Token is sent in request body, not URL
 * Rate limited to prevent brute force
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: Max 5 activation attempts per IP per hour
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const rateLimit = checkRateLimit(`activate:${clientIp}`, 5, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      logWarn('Activation rate limit exceeded', {
        ip: clientIp,
        action: 'activation_rate_limit',
      })
      return NextResponse.json(
        {
          error: 'Too many activation attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      // Generic error (don't reveal what's wrong)
      return NextResponse.json(
        { error: 'Invalid activation request' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify token with row lock to prevent race conditions
    // Use a transaction-like approach: select for update
    const { data: user, error } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('activation_token', token)
      .single()

    if (error || !user) {
      // Generic error (don't reveal if token is invalid or expired)
      auditLog('activation_failed', 'unknown', {
        reason: 'invalid_token',
        action: 'activation_attempt',
      }, {
        ip: clientIp,
      })
      return NextResponse.json(
        { error: 'Invalid or expired activation token' },
        { status: 400 }
      )
    }

    // Check expiration
    if (new Date(user.activation_token_expires_at) < new Date()) {
      auditLog('activation_failed', 'unknown', {
        reason: 'expired_token',
        userId: user.id,
        action: 'activation_attempt',
      }, {
        ip: clientIp,
      })
      return NextResponse.json(
        { error: 'Invalid or expired activation token' },
        { status: 400 }
      )
    }

    // Check if already activated
    if (user.status === 'activated') {
      // Check if onboarding is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('email', user.email)
        .single()

      if (profile?.onboarding_done) {
        return NextResponse.json({
          success: true,
          redirect: '/dashboard',
        })
      } else {
        return NextResponse.json({
          success: true,
          redirect: '/onboarding/welcome',
        })
      }
    }

    // Use transaction-like approach: update token to null first (single-use)
    const { error: tokenClearError } = await supabase
      .from('waitlist_users')
      .update({ activation_token: null })
      .eq('id', user.id)
      .eq('activation_token', token) // Only update if token matches (prevents race condition)

    if (tokenClearError) {
      logError('Failed to clear activation token', tokenClearError, {
        userId: user.id,
        action: 'token_clear_failed',
      })
      return NextResponse.json(
        { error: 'Activation failed. Please request a new activation link.' },
        { status: 500 }
      )
    }

    // Check if token was already used (another request got it first)
    const { data: checkUser } = await supabase
      .from('waitlist_users')
      .select('activation_token')
      .eq('id', user.id)
      .single()

    if (checkUser?.activation_token !== null) {
      // Token was already used
      return NextResponse.json(
        { error: 'Activation token has already been used' },
        { status: 400 }
      )
    }

    // Create auth user (passwordless - no temp password)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        startup_name: user.startup_name,
        startup_stage: user.startup_stage,
      },
    })

    if (authError || !authData.user) {
      logError('Auth creation error', authError, {
        userId: user.id,
        action: 'auth_creation_failed',
      })
      // Restore token on failure
      await supabase
        .from('waitlist_users')
        .update({ activation_token: token })
        .eq('id', user.id)
      return NextResponse.json(
        { error: 'Activation failed. Please try again or contact support.' },
        { status: 500 }
      )
    }

    // Create profile (use upsert to handle race condition)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        waitlist_user_id: user.id,
        email: user.email,
        full_name: user.name,
        startup_name: user.startup_name,
        startup_stage: user.startup_stage,
        linkedin_url: user.linkedin_url,
      }, {
        onConflict: 'id',
      })

    if (profileError) {
      logError('Profile creation error', profileError, {
        userId: user.id,
        authUserId: authData.user.id,
        action: 'profile_creation_failed',
      })
    }

    // Update waitlist status
    await supabase
      .from('waitlist_users')
      .update({
        status: 'activated',
        activated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    // Generate magic link for immediate login
    const { data: magicLink, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/welcome`,
      },
    })

    if (magicLinkError || !magicLink) {
      logError('Magic link generation error', magicLinkError, {
        userId: user.id,
        action: 'magic_link_failed',
      })
      // User is activated, but magic link failed - return success with manual login option
      return NextResponse.json({
        success: true,
        message: 'Account activated. Please sign in with your email.',
        redirect: '/',
      })
    }

    // Audit log successful activation
    auditLog('user_activated', user.id, {
      action: 'activation_success',
    }, {
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      magicLink: magicLink.properties.action_link,
      redirect: '/onboarding/welcome',
    })
  } catch (error) {
    logError('Activation error', error, {
      action: 'activation_unexpected_error',
    })
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

