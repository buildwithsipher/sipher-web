// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === 'production',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Sample rate for errors (reduce to prevent 429 rate limits)
  sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 0,

  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events in development unless explicitly testing
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null
    }
    return event
  },
})
