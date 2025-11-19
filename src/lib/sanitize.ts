/**
 * Input sanitization utilities (Server-side)
 * Prevents XSS and ensures data integrity
 */

import createDOMPurify from 'isomorphic-dompurify'

// Create DOMPurify instance that works on both server and client
const DOMPurify = createDOMPurify()

/**
 * Sanitize HTML content (removes scripts, dangerous tags)
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize plain text (removes HTML, trims, limits length)
 */
export function sanitizeText(text: string, maxLength?: number): string {
  if (!text) return ''
  
  // Remove HTML tags
  let sanitized = sanitizeHtml(text)
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Limit length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim()
  }
  
  return sanitized
}

/**
 * Sanitize handle (alphanumeric + underscore only)
 */
export function sanitizeHandle(handle: string): string {
  if (!handle) return ''
  
  // Convert to lowercase
  handle = handle.toLowerCase()
  
  // Remove all non-alphanumeric characters except underscore
  handle = handle.replace(/[^a-z0-9_]/g, '')
  
  // Limit length
  if (handle.length > 20) {
    handle = handle.substring(0, 20)
  }
  
  return handle
}

/**
 * Sanitize URL (validates and sanitizes)
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null
  
  try {
    const parsed = new URL(url)
    
    // Only allow http/https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    
    // Limit length
    if (url.length > 2048) {
      return null
    }
    
    return url
  } catch {
    return null
  }
}

/**
 * Sanitize name (text, no HTML, reasonable length)
 */
export function sanitizeName(name: string, maxLength: number = 100): string {
  return sanitizeText(name, maxLength)
}

/**
 * Sanitize tagline (text, no HTML, reasonable length)
 */
export function sanitizeTagline(tagline: string, maxLength: number = 200): string {
  return sanitizeText(tagline, maxLength)
}

