/**
 * Audit logging for security events
 * Tracks important user actions and security events
 */

import { logInfo, logWarn, logError } from './logger'

export type AuditEventType =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_failed'
  | 'handle_selected'
  | 'handle_conflict'
  | 'profile_updated'
  | 'image_uploaded'
  | 'visibility_changed'
  | 'rate_limit_exceeded'
  | 'unauthorized_access'
  | 'validation_failed'
  | 'waitlist_signup'
  | 'waitlist_signup_duplicate'
  | 'admin_approval'
  | 'user_activated'
  | 'activation_failed'
  | 'oauth_login'

export interface AuditEvent {
  type: AuditEventType
  userId: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

/**
 * Log audit event
 */
export function auditLog(
  type: AuditEventType,
  userId: string,
  metadata?: Record<string, any>,
  request?: { ip?: string; userAgent?: string }
) {
  const event: AuditEvent = {
    type,
    userId,
    metadata,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
    timestamp: new Date(),
  }

  // Log based on event type
  switch (type) {
    case 'onboarding_completed':
    case 'handle_selected':
    case 'profile_updated':
      logInfo(`[AUDIT] ${type}`, {
        userId,
        ...metadata,
        timestamp: event.timestamp.toISOString(),
      })
      break

    case 'onboarding_failed':
    case 'handle_conflict':
    case 'validation_failed':
    case 'rate_limit_exceeded':
      logWarn(`[AUDIT] ${type}`, {
        userId,
        ...metadata,
        timestamp: event.timestamp.toISOString(),
      })
      break

    case 'unauthorized_access':
      logError(`[AUDIT] ${type}`, undefined, {
        userId,
        ...metadata,
        timestamp: event.timestamp.toISOString(),
      })
      break

    default:
      logInfo(`[AUDIT] ${type}`, {
        userId,
        ...metadata,
        timestamp: event.timestamp.toISOString(),
      })
  }

  // In production, you might want to store these in a database
  // For now, they're logged via the logger utility
}
