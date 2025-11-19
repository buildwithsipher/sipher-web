'use client'

import { useSwipeable } from 'react-swipeable'

interface UseSwipeNavigationProps {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  enabled?: boolean
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: UseSwipeNavigationProps) {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (enabled) {
        onSwipeLeft()
      }
    },
    onSwipedRight: () => {
      if (enabled) {
        onSwipeRight()
      }
    },
    trackMouse: false,
    trackTouch: true,
    swipeDuration: 300,
    preventScrollOnSwipe: true,
    delta: 50, // Minimum distance for swipe
  })

  return handlers
}

