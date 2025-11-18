import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email/client'
import { waitlistConfirmationEmail } from '@/lib/email/templates'
import { EMAIL_CONFIG } from '@/lib/email/config'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { checkRateLimit } from '@/lib/rate-limit'
import { logError, logWarn } from '@/lib/logger'

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  startupName: z.string().min(1, 'Startup name is required'),
  startupStage: z.enum(['idea', 'mvp', 'launched', 'revenue', 'scaling']),
  linkedinUrl: z.union([
    z.string().url('Invalid LinkedIn URL'),
    z.literal(''),
  ]).optional(),
  city: z.string().min(1, 'City is required'),
  whatBuilding: z.string().optional(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  referralCode: z.string().optional(),
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

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist_users')
      .select('id, status')
      .eq('email', data.email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Handle referral if provided
    let referredBy: string | null = null
    if (data.referralCode) {
      const { data: referrer } = await supabase
        .from('waitlist_users')
        .select('id')
        .eq('referral_code', data.referralCode)
        .single()

      if (referrer) {
        referredBy = referrer.id
      }
    }

    // Generate referral code
    const referralCode = nanoid(8).toUpperCase()

    // Insert into waitlist
    const { data: newUser, error: insertError } = await supabase
      .from('waitlist_users')
      .insert({
        email: data.email,
        name: data.name,
        startup_name: data.startupName,
        startup_stage: data.startupStage,
        linkedin_url: data.linkedinUrl && data.linkedinUrl.trim() ? data.linkedinUrl.trim() : null,
        city: data.city,
        what_building: data.whatBuilding || null,
        website_url: data.websiteUrl && data.websiteUrl.trim() ? data.websiteUrl.trim() : null,
        referred_by: referredBy,
        referral_code: referralCode,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      logError('Failed to insert waitlist user', insertError, {
        email: data.email,
        action: 'waitlist_signup',
      })
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    // Get position in waitlist
    const { count } = await supabase
      .from('waitlist_users')
      .select('*', { count: 'exact', head: true })

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

