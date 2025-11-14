import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Allow /admin without authentication (uses secret prompt instead)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  if (pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  // For other routes, require authentication
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Add navbar here later */}
      {children}
    </div>
  )
}

