import { useCallback } from "react";

export function useHapticFeedback() {
  const trigger = useCallback((pattern: number | number[] = 10) => {
    if (typeof window === "undefined") return;
    if (!("vibrate" in navigator)) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Silently fail if vibration is not supported
    }
  }, []);

  return { trigger };
}

