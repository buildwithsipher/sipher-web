"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Hook to detect scrolling state
 * Returns true when user is actively scrolling
 * Uses aggressive throttling (150ms) to prevent excessive re-renders
 * Only updates state every 150ms for optimal performance
 */
export function useScrollDetection() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    const THROTTLE_DELAY = 150; // ms - only update state every 150ms
    const SCROLL_THRESHOLD = 100; // ms - consider scrolling stopped after 100ms

    const handleScroll = () => {
      const now = Date.now();
      
      // Throttle state updates - only update every 150ms
      if (now - lastUpdateTime.current < THROTTLE_DELAY) {
        // Extend the scroll timer but don't update state yet
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        scrollTimerRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, SCROLL_THRESHOLD);
        return;
      }

      // Update state (throttled to every 150ms)
      lastUpdateTime.current = now;
      
      // Clear existing throttle timer
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }

      // Schedule state update
      throttleTimerRef.current = setTimeout(() => {
        setIsScrolling(true);

        // Clear existing scroll timer
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }

        // Set scrolling to false after scroll stops
        scrollTimerRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, SCROLL_THRESHOLD);
      }, 0); // Update immediately on throttled frames
    };

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  return isScrolling;
}

