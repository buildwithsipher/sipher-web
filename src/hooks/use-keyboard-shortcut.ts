import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options?: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      if (options?.ctrlKey && !e.ctrlKey) return;
      if (options?.metaKey && !e.metaKey) return;
      if (options?.shiftKey && !e.shiftKey) return;
      if (options?.altKey && !e.altKey) return;

      // If ctrlKey or metaKey is required, ensure at least one is pressed
      if (options?.ctrlKey || options?.metaKey) {
        if (!e.ctrlKey && !e.metaKey) return;
      }

      e.preventDefault();
      callback(e);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options]);
}

