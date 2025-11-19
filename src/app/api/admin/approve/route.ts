import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email/client'
import { activationEmail } from '@/lib/email/templates'
import { EMAIL_CONFIG } from '@/lib/email/config'
import { generateActivationToken } from '@/lib/token-generator'
import { checkRateLimit } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit'
import { logError, logWarn } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.ADMIN_SECRET}`

    if (authHeader !== expectedAuth) {
      auditLog('unauthorized_access', 'unknown', {
        action: 'admin_approve_unauthorized',
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting on admin endpoint (100 approvals per hour per IP)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const rateLimit = checkRateLimit(`admin-approve:${clientIp}`, 100, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      logWarn('Admin approval rate limit exceeded', {
        ip: clientIp,
        action: 'admin_approve_rate_limit',
      })
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
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

    const { userId } = await request.json()

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get user details
    const { data: user, error: fetchError } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      // Generic error (don't reveal if user exists)
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    if (user.status === 'approved' || user.status === 'activated') {
      // Generic error (don't reveal status)
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Generate cryptographically secure activation token
    const activationToken = generateActivationToken()
    // Configurable expiration (default 3 days, max 7 days)
    const expirationDays = parseInt(process.env.ACTIVATION_TOKEN_EXPIRY_DAYS || '3')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + Math.min(expirationDays, 7))

    // Update user status
    const { error: updateError } = await supabase
      .from('waitlist_users')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        activation_token: activationToken,
        activation_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve user' },
        { status: 500 }
      )
    }

    // Generate magic link - token is NOT in URL, will be sent via POST
    // Redirect to activation page which will prompt for token
    const { data: magicLink, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/activate`,
      },
    })

    if (magicLinkError || !magicLink) {
      console.error('Magic link error:', magicLinkError)
      return NextResponse.json(
        { error: 'User approved but magic link generation failed' },
        { status: 500 }
      )
    }

    // Send approval email with magic link and activation token separately
    // Token should be sent in email body, not URL
    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: user.email,
        ...activationEmail({
          name: user.name,
          activationUrl: magicLink.properties.action_link,
          activationToken: activationToken, // Include token in email body
        }),
      })
    } catch (emailError) {
      logError('Failed to send activation email', emailError, {
        userId: user.id,
        action: 'email_send_failed',
      })
      return NextResponse.json(
        { error: 'User approved but email failed to send' },
        { status: 500 }
      )
    }

    // Audit log
    auditLog('admin_approval', 'admin', {
      approvedUserId: user.id,
      action: 'user_approved',
    }, {
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'User approved and activation email sent',
    })
  } catch (error) {
    logError('Admin approval error', error, {
      action: 'admin_approve_error',
    })
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

