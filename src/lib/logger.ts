/**
 * Secure logging utility
 * Sanitizes sensitive data before logging
 */

interface LogContext {
  [key: string]: any
}

/**
 * Sanitize sensitive fields from log context
 */
function sanitizeContext(context: LogContext): LogContext {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie']
  const sanitized = { ...context }

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase()
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]'
    }
    
    // Sanitize email addresses (keep domain visible)
    if (lowerKey.includes('email') && typeof sanitized[key] === 'string') {
      const email = sanitized[key] as string
      const [local, domain] = email.split('@')
      if (local && domain) {
        sanitized[key] = `${local[0]}***@${domain}`
      }
    }

    // Sanitize user IDs (keep first 4 chars)
    if (lowerKey.includes('userid') || lowerKey.includes('user_id') || lowerKey === 'id') {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 4) {
        sanitized[key] = `${(sanitized[key] as string).substring(0, 4)}***`
      }
    }
  }

  return sanitized
}

/**
 * Sanitize error object for logging
 */
function sanitizeError(error: unknown): { message: string; name?: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      // Only include stack in development
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }
  return { message: String(error) }
}

/**
 * Safe error logger - sanitizes sensitive data and sends to Sentry
 */
export function logError(message: string, error?: unknown, context?: LogContext) {
  const sanitizedError = error ? sanitizeError(error) : undefined
  const sanitizedContext = context ? sanitizeContext(context) : undefined

  if (process.env.NODE_ENV === 'production') {
    // In production, only log essential information
    console.error(`[ERROR] ${message}`, {
      error: sanitizedError?.message,
      context: sanitizedContext,
    })
  } else {
    // In development, log more details
    console.error(`[ERROR] ${message}`, {
      error: sanitizedError,
      context: sanitizedContext,
    })
  }

  // Send to Sentry in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Client-side: use dynamic import to avoid bundling issues
    import('@sentry/nextjs').then((Sentry) => {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: {
            errorType: 'client_error',
          },
          extra: {
            message,
            context: sanitizedContext,
          },
        })
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: {
            error: sanitizedError,
            context: sanitizedContext,
          },
        })
      }
    }).catch(() => {
      // Silently fail if Sentry is not available
    })
  } else if (process.env.NODE_ENV === 'production') {
    // Server-side: use dynamic import
    import('@sentry/nextjs').then((Sentry) => {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: {
            errorType: 'server_error',
          },
          extra: {
            message,
            context: sanitizedContext,
          },
        })
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: {
            error: sanitizedError,
            context: sanitizedContext,
          },
        })
      }
    }).catch(() => {
      // Silently fail if Sentry is not available
    })
  }
}

/**
 * Safe warning logger
 */
export function logWarn(message: string, context?: LogContext) {
  const sanitizedContext = context ? sanitizeContext(context) : undefined
  console.warn(`[WARN] ${message}`, sanitizedContext)
}

/**
 * Safe info logger
 */
export function logInfo(message: string, context?: LogContext) {
  const sanitizedContext = context ? sanitizeContext(context) : undefined
  console.log(`[INFO] ${message}`, sanitizedContext)
}

