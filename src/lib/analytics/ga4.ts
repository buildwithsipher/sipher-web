'use client'

// Google Analytics 4 helper functions
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, params)
  }
}

// Track waitlist signup
export const trackWaitlistSignup = (data: {
  stage: string
  city: string
  startup_name?: string
}) => {
  trackEvent('waitlist_signup', {
    event_category: 'conversion',
    event_label: 'waitlist',
    value: 1,
    ...data,
  })
}

// Track section view
export const trackSectionView = (section: string) => {
  trackEvent('section_view', {
    event_category: 'engagement',
    section,
  })
}

// Track CTA click
export const trackCTAClick = (ctaName: string, location?: string) => {
  trackEvent('cta_click', {
    event_category: 'engagement',
    cta_name: ctaName,
    location: location || 'unknown',
  })
}

