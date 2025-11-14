"use client";

import { useState, useCallback, memo } from "react";
import IndiaMapSVG from "./IndiaMapSVG";
import HeatMapGradient from "./HeatMapGradient";
import AmbientEnergyWaves from "./AmbientEnergyWaves";
import ExecutionActivityLabels from "./ExecutionActivityLabels";
import ActivityStream from "./ActivityStream";
import { useScrollDetection } from "./useScrollDetection";
import { SharedInViewProvider } from "./useSharedInView";
import SipherAsterisk from "@/components/ui/SipherAsterisk";

function IndiaPulseMapContent() {
  const [isHovered, setIsHovered] = useState(false);
  const isScrolling = useScrollDetection(); // Detect scroll for performance optimization

  // Memoize hover handlers to prevent re-renders
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
      <section 
      className="py-20 md:py-32 relative bg-noir"
      style={{
        contain: 'layout style paint', // Scroll containment for better performance
        transform: 'translate3d(0, 0, 0)', // Force GPU compositing layer - combine all transforms
        // Removed contentVisibility to avoid layout thrashing
      }}
    >
      {/* HEADER - Concise and impactful */}
      <div className="text-center mb-10 md:mb-14 px-4 sm:px-6">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 md:mb-6">
          India's Builder Pulse
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
          A living map of the energy, ambition, and momentum of founders across India.
        </p>
        <p className="text-sm md:text-base text-muted-foreground/70 max-w-xl mx-auto italic">
          Full real-time Pulse arrives in 2026 — but today, you're seeing the spirit behind it.
        </p>
      </div>

      {/* MAP CONTAINER - More prominent, better integrated */}
      <div 
        className="relative w-full max-w-5xl mx-auto px-4 sm:px-6" 
        style={{ 
          aspectRatio: '5/6',
          contain: 'layout style paint', // Scroll containment
          transform: 'translate3d(0, 0, 0)', // GPU compositing layer
          backfaceVisibility: 'hidden', // Optimize transforms
          perspective: 1000, // Enable 3D transforms
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Layer 1: Map outline */}
        <IndiaMapSVG isHovered={isHovered} isScrolling={isScrolling} />
        
        {/* Layer 2: Heat map gradient (base layer - subtle activity concentration) */}
        <HeatMapGradient isHovered={isHovered} isScrolling={isScrolling} />
        
        {/* Layer 3: Ambient energy waves (smooth pulsing animations) */}
        <AmbientEnergyWaves isHovered={isHovered} isScrolling={isScrolling} />
        
        {/* Layer 4: Execution activity labels (Sipher-specific metrics) */}
        <ExecutionActivityLabels isHovered={isHovered} isScrolling={isScrolling} />
        
        {/* Layer 5: Activity stream (founder-centric text) */}
        <ActivityStream isHovered={isHovered} isScrolling={isScrolling} />
        
        {/* Layer 6: Ambient asterisk signature (bottom-left corner, soft) */}
        {!isScrolling && (
          <div className="absolute bottom-8 left-8 pointer-events-none">
            <SipherAsterisk 
              size={16} 
              color="#06b6d4" 
              className="sipher-ast-life sipher-ast-noir opacity-40" 
              animated={false}
              ariaHidden={true}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function IndiaPulseMap() {
  // Wrap in SharedInViewProvider for single IntersectionObserver
  return (
    <SharedInViewProvider>
      <IndiaPulseMapContent />
    </SharedInViewProvider>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(IndiaPulseMap);
