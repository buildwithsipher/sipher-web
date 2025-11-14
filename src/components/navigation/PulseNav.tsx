"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const NAV_ITEMS = [
  { label: "Problem", href: "#problem", id: "problem" },
  { label: "Solution", href: "#solution", id: "solution" },
  { label: "Live Demo", href: "#demo", id: "playground" },
  { label: "ProofCard", href: "#proof", id: "proof" },
  { label: "Pulse", href: "#pulse", id: "pulse" },
  { label: "Roadmap", href: "#roadmap", id: "roadmap" },
  { label: "Letter", href: "#letter", id: "letter" },
];

export default function PulseNav() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("problem");
  const [indicatorPosition, setIndicatorPosition] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for tab switch events from landing page
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      if (customEvent.detail?.tabId) {
        setActiveTab(customEvent.detail.tabId);
      }
    };

    window.addEventListener("switchTab", handleSwitchTab as EventListener);
    return () => {
      window.removeEventListener("switchTab", handleSwitchTab as EventListener);
    };
  }, []);

  // Update indicator position when active tab changes
  useEffect(() => {
    const updatePosition = () => {
      const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeTab);
      if (activeIndex >= 0 && buttonRefs.current[activeIndex] && containerRef.current) {
        const button = buttonRefs.current[activeIndex];
        const container = containerRef.current;
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const left = buttonRect.left - containerRect.left + buttonRect.width / 2 - 2;
        setIndicatorPosition({ left, width: 4 });
      }
    };

    // Initial position
    updatePosition();

    // Update on active tab change
    const timeoutId = setTimeout(updatePosition, 0);
    
    // Also update on window resize
    window.addEventListener("resize", updatePosition);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updatePosition);
    };
  }, [activeTab]);

  const scrollTo = (href: string, id: string) => {
    // First, dispatch the tab switch event to render the section
    const event = new CustomEvent("switchTab", { detail: { tabId: id } });
    window.dispatchEvent(event);
    setActiveTab(id);
    
    // Wait for the section to render, then scroll to it
    // Use multiple attempts to find the element since it's conditionally rendered
    const attemptScroll = (attempts: number = 0) => {
      if (attempts > 10) return; // Max 10 attempts (500ms total)
      
      const el = document.querySelector(href);
      if (el) {
        const navbarHeight = 120; // Navbar height + padding
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(0, elementPosition - navbarHeight);
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      } else {
        // Retry after a short delay
        setTimeout(() => attemptScroll(attempts + 1), 50);
      }
    };
    
    // Start attempting after a small delay to allow React to render
    setTimeout(() => attemptScroll(), 100);
  };

  return (
    <div className="w-full fixed top-0 left-0 z-50 backdrop-blur-md bg-black/10">
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="flex flex-col items-center pt-6"
      >
        {/* Navigation Items */}
        <div 
          ref={containerRef}
          className="flex gap-10 text-sm md:text-base font-medium relative"
        >
          {NAV_ITEMS.map((item, index) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredIndex === index;

            return (
              <button
                key={item.href}
                ref={(el) => { buttonRefs.current[index] = el }}
                onClick={() => scrollTo(item.href, item.id)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative group"
                data-index={index}
              >
                <span
                  className={`transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : isHovered
                      ? "text-white/90"
                      : "text-white/50"
                  }`}
                >
                  {item.label}
                </span>
                {/* Small hover underline - only show when not active */}
                {!isActive && (
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-[0.5px] bg-white/40 origin-center"
                    initial={{ scaleX: 0, width: 0 }}
                    whileHover={{ scaleX: 1, width: "60%" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                )}
              </button>
            );
          })}
          
          {/* Active indicator dot that moves between sections */}
          <motion.div
            className="absolute -bottom-1 rounded-full"
            layoutId="activeIndicator"
            style={{
              left: `${indicatorPosition.left}px`,
              width: `${indicatorPosition.width}px`,
              height: `${indicatorPosition.width}px`,
              background: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
          />
        </div>

      </motion.nav>
    </div>
  );
}
