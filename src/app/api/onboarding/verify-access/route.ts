import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { auditLog } from '@/lib/audit'
import { logWarn } from '@/lib/logger'

/**
 * Verify user has access to onboarding
 * Server-side authorization check
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      auditLog('unauthorized_access', 'unknown', {
        action: 'onboarding_access_attempt',
        reason: 'not_authenticated',
      })
      return NextResponse.json(
        { error: 'Unauthorized', hasAccess: false },
        { status: 401 }
      )
    }

    // Fetch waitlist user data
    const { data: waitlistUser, error: waitlistError } = await supabase
      .from('waitlist_users')
      .select('status, email')
      .eq('email', user.email)
      .single()

    if (waitlistError || !waitlistUser) {
      auditLog('unauthorized_access', user.id, {
        action: 'onboarding_access_attempt',
        reason: 'waitlist_entry_not_found',
      })
      return NextResponse.json(
        { error: 'Waitlist entry not found', hasAccess: false },
        { status: 404 }
      )
    }

    // Check if already completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', user.id)
      .single()

    if (profile?.onboarding_done) {
      return NextResponse.json({
        hasAccess: false,
        redirect: '/dashboard',
        reason: 'already_completed',
      })
    }

    // Check status - must be approved or activated
    if (waitlistUser.status !== 'approved' && waitlistUser.status !== 'activated') {
      auditLog('unauthorized_access', user.id, {
        action: 'onboarding_access_attempt',
        reason: 'not_approved',
        status: waitlistUser.status,
      })
      return NextResponse.json({
        hasAccess: false,
        redirect: '/waitlist/dashboard',
        reason: 'not_approved',
      })
    }

    return NextResponse.json({
      hasAccess: true,
      userId: user.id,
      email: user.email,
    })
  } catch (error: any) {
    console.error('Verify access error:', error)
    return NextResponse.json(
      { error: 'Something went wrong', hasAccess: false },
      { status: 500 }
    )
  }
}

