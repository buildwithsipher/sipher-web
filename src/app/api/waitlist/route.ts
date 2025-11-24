import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email/client'
import { waitlistConfirmationEmail } from '@/lib/email/templates'
import { EMAIL_CONFIG } from '@/lib/email/config'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { checkRateLimit } from '@/lib/rate-limit'
import { logError, logWarn, logInfo } from '@/lib/logger'
import { auditLog } from '@/lib/audit'
import { sanitizeName, sanitizeText, sanitizeUrl, sanitizeTagline } from '@/lib/sanitize'

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
  startupName: z.string().min(1, 'Startup name is required').max(100, 'Startup name must be 100 characters or less'),
  startupStage: z.enum(['idea', 'mvp', 'launched', 'revenue', 'scaling']),
  linkedinUrl: z.union([
    z.string().url('Invalid LinkedIn URL').max(2048, 'URL must be 2048 characters or less'),
    z.literal(''),
  ]).optional(),
  city: z.string().min(1, 'City is required').max(100, 'City must be 100 characters or less'),
  whatBuilding: z.string().max(500, 'Description must be 500 characters or less').optional(),
  websiteUrl: z.string().url('Invalid website URL').max(2048, 'URL must be 2048 characters or less').optional().or(z.literal('')),
  referralCode: z.string().regex(/^[A-Z0-9]{8}$/, 'Invalid referral code format').optional(),
})

export async function POST(request: NextRequest) {
  let body: any = null
  try {
    body = await request.json()
    const data = waitlistSchema.parse(body)

    // Rate limiting: Max 5 signups per IP per hour (prevent spam/abuse)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const rateLimit = checkRateLimit(`signup:${clientIp}`, 5, 60 * 60 * 1000) // 5 requests per hour per IP
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    const supabase = createAdminClient()

    // Sanitize all inputs
    const sanitizedData = {
      email: data.email.toLowerCase().trim(),
      name: sanitizeName(data.name),
      startupName: sanitizeName(data.startupName),
      startupStage: data.startupStage,
      linkedinUrl: data.linkedinUrl ? sanitizeUrl(data.linkedinUrl) : null,
      city: sanitizeText(data.city, 100),
      whatBuilding: data.whatBuilding ? sanitizeTagline(data.whatBuilding, 500) : null,
      websiteUrl: data.websiteUrl ? sanitizeUrl(data.websiteUrl) : null,
    }

    // Check if email already exists (with artificial delay to prevent enumeration)
    const delay = 200 + Math.random() * 100
    await new Promise(resolve => setTimeout(resolve, delay))

    const { data: existing } = await supabase
      .from('waitlist_users')
      .select('id, status')
      .eq('email', sanitizedData.email)
      .single()

    // Always return same response to prevent email enumeration
    // If email exists, we still process but don't reveal it
    if (existing) {
      // Log for audit but don't reveal to user
      auditLog('waitlist_signup_duplicate', 'unknown', {
        email: sanitizedData.email.substring(0, 3) + '***',
        action: 'duplicate_signup_attempt',
      })
      
      // Return generic success message (don't reveal email exists)
      return NextResponse.json({
        success: true,
        message: 'If this email is not registered, you will receive a confirmation email.',
        // Don't return position or referral code
      })
    }

    // Handle referral if provided (with rate limiting)
    let referredBy: string | null = null
    if (data.referralCode) {
      // Rate limit referral code checks
      const referralRateLimit = checkRateLimit(`referral-check:${clientIp}`, 20, 60 * 60 * 1000)
      if (!referralRateLimit.allowed) {
        logWarn('Referral code check rate limit exceeded', {
          ip: clientIp,
          action: 'referral_check_rate_limit',
        })
        // Continue without referral (don't fail signup)
      } else {
        const { data: referrer } = await supabase
          .from('waitlist_users')
          .select('id')
          .eq('referral_code', data.referralCode.toUpperCase())
          .single()

        if (referrer) {
          referredBy = referrer.id
        }
        // Don't reveal if referral code is invalid (prevent enumeration)
      }
    }

    // Generate referral code
    const referralCode = nanoid(8).toUpperCase()

    // Insert into waitlist with sanitized data
    const { data: newUser, error: insertError } = await supabase
      .from('waitlist_users')
      .insert({
        email: sanitizedData.email,
        name: sanitizedData.name,
        startup_name: sanitizedData.startupName,
        startup_stage: sanitizedData.startupStage,
        linkedin_url: sanitizedData.linkedinUrl,
        city: sanitizedData.city,
        what_building: sanitizedData.whatBuilding,
        website_url: sanitizedData.websiteUrl,
        referred_by: referredBy,
        referral_code: referralCode,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      logError('Failed to insert waitlist user', insertError, {
        email: sanitizedData.email.substring(0, 3) + '***',
        action: 'waitlist_signup',
      })
      // Generic error (don't reveal details)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again later.' },
        { status: 500 }
      )
    }

    // Audit log successful signup
    auditLog('waitlist_signup', 'unknown', {
      userId: newUser.id,
      hasReferral: !!referredBy,
      action: 'waitlist_signup_success',
    }, {
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // Get position in waitlist
    const { count, error: countError } = await supabase
      .from('waitlist_users')
      .select('id', { count: 'exact' })
      .limit(1)

    if (countError) {
      logWarn('Failed to fetch waitlist count for confirmation email', {
        action: 'waitlist_signup_count',
      })
    }

    const actualPosition = count || 0
    // Add 100 for "fake it till we make it" - same as dashboard
    const displayedPosition = actualPosition > 0 ? actualPosition + 100 : 0

    // Send confirmation email
    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        ...waitlistConfirmationEmail({
          name: data.name,
          position: displayedPosition,
          referralCode: newUser.referral_code,
        }),
      })
    } catch (emailError) {
      logWarn('Failed to send confirmation email', {
        email: data.email,
        action: 'email_send',
      })
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      position: displayedPosition,
      referralCode: newUser.referral_code,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    // Capture error in Sentry
    if (error instanceof Error) {
      const Sentry = await import('@sentry/nextjs')
      Sentry.captureException(error, {
        tags: {
          section: 'waitlist',
          action: 'join',
        },
        extra: {
          hasBody: !!body,
          // Don't include email in Sentry - it's PII
        },
      })
    }
    
    logError('Waitlist signup error', error, {
      action: 'waitlist_signup',
      hasBody: !!body,
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

