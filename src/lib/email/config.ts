/**
 * Email configuration
 * Centralized email settings for the application
 */

export const EMAIL_CONFIG = {
  // From email address - uses verified domain from Resend
  FROM_EMAIL: 'Sipher <hey@updates.sipher.in>',
  
  // Reply-to email (optional)
  REPLY_TO: 'hey@updates.sipher.in',
  
  // Domain used for email sending
  DOMAIN: 'updates.sipher.in',
} as const

