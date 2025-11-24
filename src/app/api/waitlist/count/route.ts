import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logError } from '@/lib/logger';

// Simple in-memory cache for count (1 minute TTL)
// This reduces database load during high traffic
let cachedCount: { count: number; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: NextRequest) {
  try {
    // Check cache first (reduces DB load during traffic spikes)
    const now = Date.now();
    if (cachedCount && (now - cachedCount.timestamp) < CACHE_TTL) {
      return NextResponse.json({ count: cachedCount.count });
    }

    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from('waitlist_users')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      logError('Failed to fetch waitlist count', error, {
        action: 'fetch_count',
      });
      if (cachedCount) {
        // Serve stale data instead of total failure
        return NextResponse.json(
          { count: cachedCount.count, stale: true },
          { status: 200 }
        );
      }
      return NextResponse.json({ error: 'Failed to fetch waitlist count' }, { status: 500 });
    }

    const finalCount = count || 0;
    
    // Update cache
    cachedCount = {
      count: finalCount,
      timestamp: now,
    };

    return NextResponse.json({ count: finalCount });
  } catch (error) {
    logError('Unexpected error fetching waitlist count', error, {
      action: 'fetch_count_unexpected',
    });
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

