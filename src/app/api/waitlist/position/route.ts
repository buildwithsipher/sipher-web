import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
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

    // Rate limiting: Max 30 requests per user per minute (prevent abuse)
    const rateLimit = checkRateLimit(`position:${user.id}`, 30, 60 * 1000) // 30 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    // Get user's waitlist entry to find their created_at
    const { data: waitlistUser, error: fetchError } = await supabase
      .from('waitlist_users')
      .select('created_at')
      .eq('email', user.email)
      .single()

    if (fetchError || !waitlistUser) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
    }

    // Use admin client to bypass RLS and count users before this user
    const adminSupabase = createAdminClient()
    const { count: usersBeforeMeCount, error: countError } = await adminSupabase
      .from('waitlist_users')
      .select('id', { count: 'exact' })
      .limit(1)
      .lt('created_at', waitlistUser.created_at)

    if (countError) {
      logError('Failed to calculate position', countError, {
        action: 'calculate_position',
      })
      return NextResponse.json({ error: 'Failed to calculate position' }, { status: 500 })
    }

    // Position is number of users before + 1
    const actualPosition = (usersBeforeMeCount || 0) + 1
    // Add 100 for "fake it till we make it" - same as dashboard
    const displayedPosition = actualPosition > 0 ? actualPosition + 100 : 0

    return NextResponse.json({
      position: actualPosition,
      displayedPosition,
    })
  } catch (error) {
    logError('Unexpected error calculating position', error, {
      action: 'calculate_position_unexpected',
    })
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
