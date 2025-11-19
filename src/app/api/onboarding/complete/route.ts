import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { onboardingCompleteSchema } from '@/lib/validation/onboarding'
import { 
  sanitizeHandle, 
  sanitizeName, 
  sanitizeTagline, 
  sanitizeUrl,
  sanitizeText 
} from '@/lib/sanitize'
import { logError, logWarn, logInfo } from '@/lib/logger'
import { auditLog } from '@/lib/audit'

/**
 * Complete onboarding flow
 * Server-side validation and sanitization
 * Rate limited to prevent abuse
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

    // Rate limiting: Max 1 completion per user per hour
    const rateLimit = checkRateLimit(`onboarding-complete:${user.id}`, 1, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      logWarn('Onboarding completion rate limit exceeded', {
        userId: user.id,
        action: 'onboarding_complete_rate_limit',
      })
      return NextResponse.json(
        {
          error: 'Too many completion attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '1',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    // Verify user is approved/activated
    const { data: waitlistUser, error: waitlistError } = await supabase
      .from('waitlist_users')
      .select('status, email')
      .eq('email', user.email)
      .single()

    if (waitlistError || !waitlistUser) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      )
    }

    if (waitlistUser.status !== 'approved' && waitlistUser.status !== 'activated') {
      return NextResponse.json(
        { error: 'User not approved for onboarding' },
        { status: 403 }
      )
    }

    // Check if already completed
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('onboarding_done, builder_handle')
      .eq('id', user.id)
      .single()

    if (existingProfile?.onboarding_done) {
      return NextResponse.json(
        { error: 'Onboarding already completed' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Sanitize all inputs first
    const sanitizedData = {
      handle: sanitizeHandle(body.handle || ''),
      name: sanitizeName(body.name || ''),
      startupName: sanitizeName(body.startupName || '', 100),
      startupStage: body.startupStage || null,
      city: sanitizeText(body.city || '', 100) || null,
      tagline: sanitizeTagline(body.tagline || '') || null,
      websiteUrl: sanitizeUrl(body.websiteUrl || '') || null,
      linkedinUrl: sanitizeUrl(body.linkedinUrl || '') || null,
      profilePictureUrl: sanitizeUrl(body.profilePictureUrl || '') || null,
      startupLogoUrl: sanitizeUrl(body.startupLogoUrl || '') || null,
      defaultVisibility: body.defaultVisibility || 'public',
    }

    // Validate with Zod schema
    let validatedData
    try {
      validatedData = onboardingCompleteSchema.parse(sanitizedData)
    } catch (validationError: any) {
      auditLog('validation_failed', user.id, {
        errors: validationError.errors,
        action: 'onboarding_complete',
      })
      // Don't expose detailed validation errors to client (security)
      logWarn('Onboarding validation failed', {
        userId: user.id,
        errorCount: validationError.errors?.length || 0,
        action: 'onboarding_validation_failed',
      })
      
      return NextResponse.json(
        {
          error: 'Invalid input. Please check all fields and try again.',
          // Only return first error to client (don't reveal all validation rules)
          detail: validationError.errors?.[0]?.message || 'Validation failed',
        },
        { status: 400 }
      )
    }

    // Use admin client for database operations
    const adminSupabase = createAdminClient()

    // Check handle availability (with conflict handling)
    const { data: handleExists } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('builder_handle', validatedData.handle)
      .single()

    if (handleExists) {
      // Handle conflict - suggest alternatives
      const suggestions = [
        `${validatedData.handle}_${Math.floor(Math.random() * 100)}`,
        `${validatedData.handle}${Math.floor(Math.random() * 1000)}`,
        `${validatedData.handle}_${Date.now().toString().slice(-4)}`,
      ]

      auditLog('handle_conflict', user.id, {
        handle: validatedData.handle,
        action: 'onboarding_complete',
      })

      return NextResponse.json(
        {
          error: 'Handle is already taken',
          suggestions,
        },
        { status: 409 }
      )
    }

    // Update profile with validated and sanitized data
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        builder_handle: validatedData.handle,
        full_name: validatedData.name,
        startup_name: validatedData.startupName,
        startup_stage: validatedData.startupStage,
        tagline: validatedData.tagline,
        profile_picture_url: validatedData.profilePictureUrl,
        startup_logo_url: validatedData.startupLogoUrl,
        default_visibility: validatedData.defaultVisibility,
        onboarding_done: true,
      })
      .eq('id', user.id)

    if (profileError) {
      // Check for unique constraint violation
      if (profileError.code === '23505' || profileError.message?.includes('unique')) {
        // Handle was taken between check and insert (race condition)
        const suggestions = [
          `${validatedData.handle}_${Math.floor(Math.random() * 100)}`,
          `${validatedData.handle}${Math.floor(Math.random() * 1000)}`,
        ]

        logWarn('Handle conflict during profile update', {
          userId: user.id,
          handle: validatedData.handle,
          action: 'handle_conflict_update',
        })

        return NextResponse.json(
          {
            error: 'Handle is already taken. Please choose another.',
            suggestions,
          },
          { status: 409 }
        )
      }

      logError('Failed to update profile', profileError, {
        userId: user.id,
        action: 'profile_update_failed',
      })

      return NextResponse.json(
        { error: 'Failed to complete onboarding' },
        { status: 500 }
      )
    }

    // Update waitlist_users with images if provided
    if (validatedData.profilePictureUrl || validatedData.startupLogoUrl) {
      await adminSupabase
        .from('waitlist_users')
        .update({
          profile_picture_url: validatedData.profilePictureUrl,
          startup_logo_url: validatedData.startupLogoUrl,
        })
        .eq('email', user.email)
    }

    // Audit log
    auditLog('onboarding_completed', user.id, {
      handle: validatedData.handle,
      visibility: validatedData.defaultVisibility,
    }, {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      handle: validatedData.handle,
    })
  } catch (error: any) {
    logError('Unexpected onboarding completion error', error, {
      action: 'onboarding_complete_unexpected',
    })
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

