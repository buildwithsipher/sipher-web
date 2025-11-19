/**
 * Cryptographically secure token generation
 * Uses crypto.randomBytes for secure random tokens
 */

import { randomBytes } from 'crypto'

/**
 * Generate a cryptographically secure random token
 * @param length - Length of token in bytes (default: 32 bytes = 64 hex chars)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

/**
 * Generate a secure activation token (64 hex characters)
 */
export function generateActivationToken(): string {
  return generateSecureToken(32) // 64 hex characters
}

