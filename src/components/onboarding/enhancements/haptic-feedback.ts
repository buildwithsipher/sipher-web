/**
 * Haptic feedback utility for mobile devices
 * Provides vibration feedback on user interactions
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'

const hapticPatterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10], // Short, pause, short
  error: [20, 50, 20, 50, 20], // Three pulses
  warning: [15, 30, 15], // Two pulses
}

export function triggerHaptic(type: HapticType = 'medium') {
  if (typeof window === 'undefined') return
  if (!('vibrate' in navigator)) return

  const pattern = hapticPatterns[type]
  
  try {
    navigator.vibrate(pattern)
  } catch (error) {
    // Silently fail if vibration is not supported
    console.debug('Haptic feedback not available')
  }
}

/**
 * Hook to trigger haptic feedback on click
 */
export function useHapticFeedback(type: HapticType = 'medium') {
  return () => triggerHaptic(type)
}

