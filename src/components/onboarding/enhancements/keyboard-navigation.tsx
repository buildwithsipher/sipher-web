'use client'

import { useEffect } from 'react'

interface UseKeyboardNavigationProps {
  onNext: () => void
  onBack: () => void
  onSkip?: () => void
  disabled?: boolean
}

/**
 * Hook for keyboard navigation in onboarding flow
 * Supports: Enter (next), Escape (back), Arrow keys, Tab navigation
 */
export function useKeyboardNavigation({
  onNext,
  onBack,
  onSkip,
  disabled = false,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default if we're handling the key
      const handledKeys = ['Enter', 'Escape', 'ArrowLeft', 'ArrowRight']
      
      if (!handledKeys.includes(e.key)) return

      // Don't handle if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Enter in textareas, but handle Escape
        if (e.key === 'Escape') {
          e.preventDefault()
          onBack()
        }
        return
      }

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          onNext()
          break
        case 'Escape':
          e.preventDefault()
          onBack()
          break
        case 'ArrowRight':
          e.preventDefault()
          onNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onBack()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNext, onBack, disabled])
}

/**
 * Component to show keyboard hints
 */
export function KeyboardHints() {
  return (
    <div className="fixed bottom-4 right-4 glass-card rounded-lg p-3 text-xs text-white/60 space-y-1 z-50">
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">Enter</kbd>
        <span>Continue</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">Esc</kbd>
        <span>Back</span>
      </div>
    </div>
  )
}

