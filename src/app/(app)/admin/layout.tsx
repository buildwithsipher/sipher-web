import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For now, allow access. In production, add admin role check
  // if (!user || !isAdmin(user)) {
  //   redirect('/')
  // }

  return <>{children}</>
}

