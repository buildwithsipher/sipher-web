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
