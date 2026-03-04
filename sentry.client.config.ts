// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === 'production',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable capturing Replay for user sessions (reduced to prevent rate limiting)
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0,

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Sample rate for errors (reduce to prevent 429 rate limits)
  sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 0,

  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events in development unless explicitly testing
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
      return null
    }
    return event
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    'fb_xd_fragment',
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // Network errors that are not actionable (but keep HTTP errors)
    'NetworkError',
    // ResizeObserver errors (common and not critical)
    'ResizeObserver loop limit exceeded',
  ],
})
