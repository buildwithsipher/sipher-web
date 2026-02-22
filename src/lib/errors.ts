/**
 * Error handling utilities for type-safe error management
 * Use these functions to safely handle errors in catch blocks
 */

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return 'An unexpected error occurred'
}

/**
 * Log error with context (console in dev, Sentry in prod)
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error)
  console.error(`[${context}]`, { error, message })

  // TODO: Add Sentry when configured
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: { context } })
  // }
}

/**
 * Handle API errors with proper typing
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = 'Request failed'

  try {
    const data = await response.json()
    errorMessage = data.error || data.message || errorMessage
  } catch {
    // Response wasn't JSON
    errorMessage = `${response.status} ${response.statusText}`
  }

  throw new Error(errorMessage)
}

/**
 * Supabase error handler with user-friendly messages
 */
export function handleSupabaseError(error: unknown): string {
  const message = getErrorMessage(error)

  // Handle common Supabase errors
  if (message.includes('duplicate key')) {
    return 'This item already exists'
  }
  if (message.includes('foreign key')) {
    return 'Cannot delete: item is being used elsewhere'
  }
  if (message.includes('not found')) {
    return 'Item not found'
  }
  if (message.includes('permission denied')) {
    return 'You do not have permission to perform this action'
  }
  if (message.includes('expired')) {
    return 'This link has expired. Please request a new one.'
  }
  if (message.includes('invalid')) {
    return 'Invalid request. Please check your input and try again.'
  }

  return message
}

/**
 * Type guard for error objects with message property
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}
