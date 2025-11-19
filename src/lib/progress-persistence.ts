/**
 * Progress persistence for onboarding flow
 * Encrypts and stores progress in localStorage
 */

const STORAGE_KEY = 'sipher_onboarding_progress'
const ENCRYPTION_KEY = 'sipher_progress_v1' // In production, use proper encryption

/**
 * Simple obfuscation (not real encryption, but prevents casual inspection)
 * For production, use proper encryption like crypto-js
 */
function obfuscate(data: string): string {
  if (typeof window === 'undefined') return data
  return btoa(data) // Base64 encoding (basic obfuscation)
}

function deobfuscate(data: string): string {
  if (typeof window === 'undefined') return data
  try {
    return atob(data)
  } catch {
    return ''
  }
}

/**
 * Save onboarding progress
 */
export function saveOnboardingProgress(data: {
  currentScreen: number
  formData: any
  timestamp: number
}) {
  if (typeof window === 'undefined') return

  try {
    const serialized = JSON.stringify(data)
    const obfuscated = obfuscate(serialized)
    localStorage.setItem(STORAGE_KEY, obfuscated)
  } catch (error) {
    console.error('Failed to save progress:', error)
  }
}

/**
 * Load onboarding progress
 */
export function loadOnboardingProgress(): {
  currentScreen: number
  formData: any
  timestamp: number
} | null {
  if (typeof window === 'undefined') return null

  try {
    const obfuscated = localStorage.getItem(STORAGE_KEY)
    if (!obfuscated) return null

    const serialized = deobfuscate(obfuscated)
    const data = JSON.parse(serialized)

    // Check if progress is stale (older than 24 hours)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    if (now - data.timestamp > maxAge) {
      clearOnboardingProgress()
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to load progress:', error)
    clearOnboardingProgress()
    return null
  }
}

/**
 * Clear onboarding progress
 */
export function clearOnboardingProgress() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

