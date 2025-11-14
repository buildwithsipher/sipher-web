"use client";

import { motion } from "framer-motion";
import { useMemo, memo } from "react";
import { useSharedInView } from "./useSharedInView";

interface ActivityStreamProps {
  isHovered?: boolean;
  isScrolling?: boolean;
}

// Founder-centric activity stream text
const activityMessages = [
  "A founder shipped today",
  "Building in Mumbai",
  "Growing in Bangalore",
  "A founder shipped today",
  "Building in Delhi",
  "A founder shipped today",
  "Growing in Pune",
  "A founder shipped today",
  "Building in Hyderabad",
  "A founder shipped today",
  "Growing in Chennai",
  "A founder shipped today",
  "Building in Kolkata",
];

function ActivityStream({ isHovered = false, isScrolling = false }: ActivityStreamProps) {
  const { inView } = useSharedInView(); // Use shared observer

  // Generate random positions and timing for activity messages - REDUCED COUNT
  const activityData = useMemo(() => {
    const count = 3 + Math.floor(Math.random() * 2); // 3-4 messages (reduced from 5-7)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      text: activityMessages[Math.floor(Math.random() * activityMessages.length)],
      x: 20 + Math.random() * 60, // 20-80% (tighter bounds)
      y: 35 + Math.random() * 40, // 35-75% (tighter bounds)
      delay: 3.2 + i * 0.5 + Math.random() * 0.5, // Better staggered start
      duration: 4.5 + Math.random() * 1.0, // 4.5-5.5s (smoother)
      initialDelay: i * 0.4, // Better stagger
    }));
  }, []);

  // Speed up slightly on hover
  const floatSpeed = isHovered ? 0.85 : 1.0;

  // Conditional rendering - don't render messages during scroll
  if (isScrolling) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        contain: 'layout style paint', // Scroll containment
        transform: 'translate3d(0, 0, 0)', // GPU compositing
        willChange: 'transform, opacity', // Keep constant
      }}
    >
      {activityData.map((activity) => (
        <motion.div
          key={activity.id}
          className="absolute"
          style={{
            left: `${activity.x}%`,
            top: `${activity.y}%`,
            transform: "translate3d(-50%, -50%, 0)", // Better GPU acceleration
          }}
          initial={{ opacity: 0, y: 0, scale: 0.9 }}
          animate={inView ? {
            opacity: 0.8,
            y: -40,
            scale: 1,
          } : { 
            opacity: 0,
            y: 0, 
            scale: 0.9 
          }}
          transition={{
            opacity: {
              duration: 0.4,
              delay: activity.delay + activity.initialDelay,
              ease: [0.4, 0, 0.2, 1],
            },
            y: {
              duration: activity.duration * floatSpeed * 0.9,
              delay: activity.delay + activity.initialDelay,
              ease: [0.4, 0, 0.2, 1],
              repeat: Infinity,
              repeatDelay: 4 + Math.random() * 3,
            },
            scale: {
              duration: 0.3,
              delay: activity.delay + activity.initialDelay,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
        >
          <div 
            className="px-3 py-1.5 rounded-lg bg-black/80 border border-cyan-500/20 text-xs md:text-sm font-light text-cyan-300/90 whitespace-nowrap"
            style={{
              // Removed backdrop-filter entirely - too expensive
              willChange: 'transform, opacity',
              transform: 'translate3d(0, 0, 0)', // GPU layer creation
            }}
          >
            {activity.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Memoize to prevent re-renders when isHovered changes
export default memo(ActivityStream);

