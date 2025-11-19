import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { SkeletonCard } from '@/components/ui/skeleton'
import { Suspense } from 'react'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_done')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_done) {
    // Check waitlist status
    const { data: waitlistUser } = await supabase
      .from('waitlist_users')
      .select('status')
      .eq('email', user.email)
      .single()

    if (waitlistUser?.status === 'approved' || waitlistUser?.status === 'activated') {
      redirect('/onboarding/welcome')
    } else {
      redirect('/waitlist/dashboard')
    }
  }

  // Mock data - replace with real data from your database
  const mockData = {
    momentum: 87,
    consistency: 92,
    totalLogs: 42,
    activeDays: 28,
    streak: 7,
  }

  return (
    <Suspense fallback={<SkeletonCard className="min-h-[400px]" />}>
      <DashboardContent userEmail={user.email || ''} mockData={mockData} />
    </Suspense>
  )
}
