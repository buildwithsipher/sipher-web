import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit'
import { logError, logWarn } from '@/lib/logger'
import { sanitizeName, sanitizeText, sanitizeUrl, sanitizeTagline } from '@/lib/sanitize'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less').optional(),
  startup_name: z.string().min(1, 'Startup name is required').max(100, 'Startup name must be 100 characters or less').optional(),
  startup_stage: z.enum(['idea', 'mvp', 'launched', 'revenue', 'scaling']).optional(),
  city: z.string().max(100, 'City must be 100 characters or less').optional(),
  what_building: z.string().max(500, 'Description must be 500 characters or less').optional(),
  website_url: z.string().url('Invalid website URL').max(2048, 'URL must be 2048 characters or less').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid LinkedIn URL').max(2048, 'URL must be 2048 characters or less').optional().or(z.literal('')),
})

/**
 * Secure profile update endpoint
 * Server-side validation and sanitization
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting: Max 10 updates per user per hour
    const rateLimit = checkRateLimit(`profile-update:${user.id}`, 10, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      logWarn('Profile update rate limit exceeded', {
        userId: user.id,
        action: 'profile_update_rate_limit',
      })
      return NextResponse.json(
        {
          error: 'Too many update attempts. Please try again later.',
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

    const body = await request.json()

    // Validate with Zod
    let validatedData
    try {
      validatedData = profileUpdateSchema.parse(body)
    } catch (validationError: any) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationError.errors?.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    // Sanitize all inputs
    const sanitizedData: any = {}
    if (validatedData.name) sanitizedData.name = sanitizeName(validatedData.name)
    if (validatedData.startup_name) sanitizedData.startup_name = sanitizeName(validatedData.startup_name)
    if (validatedData.startup_stage) sanitizedData.startup_stage = validatedData.startup_stage
    if (validatedData.city) sanitizedData.city = sanitizeText(validatedData.city, 100)
    if (validatedData.what_building) sanitizedData.what_building = sanitizeTagline(validatedData.what_building, 500)
    if (validatedData.website_url) sanitizedData.website_url = sanitizeUrl(validatedData.website_url)
    if (validatedData.linkedin_url) sanitizedData.linkedin_url = sanitizeUrl(validatedData.linkedin_url)

    // Get waitlist user
    const { data: waitlistUser } = await supabase
      .from('waitlist_users')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!waitlistUser) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      )
    }

    // Update using admin client (bypasses RLS for server-side updates)
    const adminSupabase = createAdminClient()
    const { error: updateError } = await adminSupabase
      .from('waitlist_users')
      .update(sanitizedData)
      .eq('id', waitlistUser.id)

    if (updateError) {
      logError('Failed to update profile', updateError, {
        userId: user.id,
        action: 'profile_update_failed',
      })
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Audit log
    auditLog('profile_updated', user.id, {
      fields: Object.keys(sanitizedData),
      action: 'profile_update',
    }, {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    logError('Profile update error', error, {
      action: 'profile_update_unexpected',
    })
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

