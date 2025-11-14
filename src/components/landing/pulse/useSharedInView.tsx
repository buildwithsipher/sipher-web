"use client";

import { createContext, useContext, useRef, ReactNode } from "react";
import { useInView } from "framer-motion";

/**
 * Shared IntersectionObserver context to avoid multiple observers
 * All components use a single observer for better performance
 */

interface SharedInViewContextType {
  inView: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
}

const SharedInViewContext = createContext<SharedInViewContextType | null>(null);

export function SharedInViewProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SharedInViewContext.Provider value={{ inView, ref }}>
      <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', pointerEvents: 'none' }} aria-hidden="true" />
      {children}
    </SharedInViewContext.Provider>
  );
}

export function useSharedInView() {
  const context = useContext(SharedInViewContext);
  if (!context) {
    // Fallback to individual observer if context not available (shouldn't happen)
    throw new Error('useSharedInView must be used within SharedInViewProvider');
  }
  return context;
}

