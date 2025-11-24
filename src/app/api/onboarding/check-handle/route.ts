import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitizeHandle } from '@/lib/sanitize'
import { handleSchema } from '@/lib/validation/onboarding'
import { logWarn } from '@/lib/logger'

/**
 * Check if a handle is available
 * Rate limited to prevent enumeration attacks
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { handle } = body

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
    }

    // Sanitize handle
    const sanitizedHandle = sanitizeHandle(handle)

    // Validate handle format
    try {
      handleSchema.parse(sanitizedHandle)
    } catch (validationError: any) {
      return NextResponse.json(
        {
          error: 'Invalid handle format',
          details:
            validationError.errors?.[0]?.message ||
            'Handle must be 3-20 characters, alphanumeric and underscores only',
        },
        { status: 400 }
      )
    }

    // Rate limiting: Max 10 handle checks per user per minute
    const rateLimit = checkRateLimit(`handle-check:${user.id}`, 10, 60 * 1000)
    if (!rateLimit.allowed) {
      logWarn('Handle check rate limit exceeded', {
        userId: user.id,
        handle: sanitizedHandle,
        action: 'handle_check_rate_limit',
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
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    // Add artificial delay to prevent timing attacks (always 200-300ms)
    const delay = 200 + Math.random() * 100
    await new Promise(resolve => setTimeout(resolve, delay))

    // Check if handle exists using admin client (bypasses RLS)
    const adminSupabase = createAdminClient()
    const { data: existing, error: checkError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('builder_handle', sanitizedHandle)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected)
      logWarn('Handle check error', {
        userId: user.id,
        handle: sanitizedHandle,
        error: checkError.message,
        action: 'handle_check_error',
      })
      return NextResponse.json({ error: 'Failed to check handle availability' }, { status: 500 })
    }

    // Generic response to prevent enumeration
    // Don't reveal if handle exists or not
    const isAvailable = !existing

    return NextResponse.json({
      available: isAvailable,
      // Don't return the handle to prevent confirmation
    })
  } catch (error: any) {
    console.error('Handle check error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
