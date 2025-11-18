'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

export const initPostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog loaded')
        }
      },
      capture_pageview: true,
      capture_pageleave: true,
      // Disable in development unless explicitly enabled
      disabled: process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_POSTHOG_DEBUG,
    })
  }
}

export { posthog }

// Helper functions for common events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    try {
      // Check if PostHog is initialized
      if (posthog && typeof posthog.capture === 'function') {
        posthog.capture(eventName, properties)
      }
    } catch (error) {
      // Silently fail in case PostHog isn't loaded yet
      if (process.env.NODE_ENV === 'development') {
        console.warn('PostHog not ready:', error)
      }
    }
  }
}

export const trackWaitlistSignup = (data: {
  startup_stage: string
  city: string
  startup_name?: string
}) => {
  trackEvent('waitlist_signup', {
    event_category: 'conversion',
    ...data,
  })
}

export const trackSectionView = (section: string) => {
  trackEvent('section_view', {
    section,
    event_category: 'engagement',
  })
}

export const trackCTAClick = (ctaName: string, location?: string) => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    location: location || 'unknown',
    event_category: 'engagement',
  })
}

export const trackFormStart = (formName: string) => {
  trackEvent('form_start', {
    form_name: formName,
    event_category: 'engagement',
  })
}

export const trackFormAbandon = (formName: string, step?: string) => {
  trackEvent('form_abandon', {
    form_name: formName,
    step: step || 'unknown',
    event_category: 'engagement',
  })
}

// Feature Flag Helpers
export const getFeatureFlag = (flagKey: string): string | boolean | undefined => {
  if (typeof window !== 'undefined' && posthog) {
    try {
      return posthog.getFeatureFlag(flagKey)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Feature flag error:', error)
      }
      return undefined
    }
  }
  return undefined
}

export const isFeatureEnabled = (flagKey: string): boolean => {
  if (typeof window !== 'undefined' && posthog) {
    try {
      return posthog.isFeatureEnabled(flagKey) || false
    } catch (error) {
      return false
    }
  }
  return false
}

export const trackFeatureFlagExposure = (flagKey: string, variant: string | boolean) => {
  trackEvent('feature_flag_shown', {
    flag_key: flagKey,
    variant: variant,
    event_category: 'feature_flag',
  })
}

