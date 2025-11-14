"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoGridProps {
  className?: string;
  children: ReactNode;
}

interface BentoCardProps {
  className?: string;
  children: ReactNode;
  span?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  delay?: number;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  className,
  children,
  span = 1,
  rowSpan = 1,
  delay = 0,
}: BentoCardProps) {
  const colSpanClass = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
  }[span];

  const rowSpanClass = {
    1: "md:row-span-1",
    2: "md:row-span-2",
    3: "md:row-span-3",
  }[rowSpan];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]",
        colSpanClass,
        rowSpanClass,
        className
      )}
    >
      {/* Glassmorphism enhancement */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
      
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}

