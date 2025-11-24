import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Security: Require authentication - only logged-in users can access
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS and fetch anonymized data
    const adminSupabase = createAdminClient()

    // Fetch only the last 5 users who joined (most recent first)
    // Only select city and created_at - no identifying information
    const { data, error } = await adminSupabase
      .from('waitlist_users')
      .select('id, city, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      logError('Failed to fetch live activities', error, {
        action: 'fetch_activities',
      })
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ activities: [] })
    }

    // Anonymize all data - only show city if available, no names or identifying info
    const activities = data.map(u => {
      const action = u.city ? `joined from ${u.city}` : 'joined the waitlist'

      return {
        id: u.id,
        action,
        city: u.city,
        timestamp: u.created_at,
      }
    })

    return NextResponse.json({ activities })
  } catch (error) {
    logError('Unexpected error fetching activities', error, {
      action: 'fetch_activities_unexpected',
    })
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
