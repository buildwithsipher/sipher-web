"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SkipNavigation() {
  const [isVisible, setIsVisible] = useState(false);
  const hasTabbedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only show on first Tab press (keyboard navigation detected)
      if (e.key === "Tab" && !hasTabbedRef.current) {
        hasTabbedRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseDown = () => {
      // Hide when mouse is used (user is not using keyboard)
      if (hasTabbedRef.current) {
        setIsVisible(false);
        // Reset after a delay so Tab still works
        setTimeout(() => {
          hasTabbedRef.current = false;
        }, 1000);
      }
    };

    const handleClick = () => {
      // Hide when any click happens
      setIsVisible(false);
    };

    // Only show on Tab key (keyboard navigation)
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const skipLinks = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#footer", label: "Skip to footer" },
  ];

  // Only render if user is using keyboard navigation
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 z-[100] flex flex-col gap-2"
        aria-label="Skip navigation"
      >
        {skipLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0C] transition-all"
            onClick={() => setIsVisible(false)}
          >
            {link.label}
          </a>
        ))}
      </motion.nav>
    </AnimatePresence>
  );
}

