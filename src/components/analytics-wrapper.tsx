'use client'

import { useEffect, useState } from 'react'

export function AnalyticsWrapper() {
  const [Analytics, setAnalytics] = useState<React.ComponentType | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Try to dynamically import Analytics only on client side
    // Use a try-catch with dynamic import that won't fail at build time
    const loadAnalytics = async () => {
      try {
        // Check if module exists first
        const mod = await import('@vercel/analytics/react')
        if (mod && mod.Analytics) {
          setAnalytics(() => mod.Analytics)
        }
      } catch (error) {
        // Package not installed - silently fail
        // This is expected if @vercel/analytics is not installed
      }
    }

    loadAnalytics()
  }, [])

  // Don't render anything if not on client or Analytics not loaded
  if (!isClient || !Analytics) return null
  return <Analytics />
}
