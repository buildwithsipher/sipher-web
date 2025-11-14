"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SipherEnergyState {
  cursorSpeed: number;
  isIdle: boolean;
  isMoving: boolean;
  shouldSyncAura: boolean;
  shouldSyncPulse: boolean;
}

interface SipherEnergyContextType {
  energy: SipherEnergyState;
  setCursorSpeed: (speed: number) => void;
  setIsIdle: (idle: boolean) => void;
  setIsMoving: (moving: boolean) => void;
  triggerSectionSync: () => void;
}

const SipherEnergyContext = createContext<SipherEnergyContextType | undefined>(undefined);

export function SipherEnergyProvider({ children }: { children: ReactNode }) {
  const [energy, setEnergy] = useState<SipherEnergyState>({
    cursorSpeed: 0,
    isIdle: false,
    isMoving: false,
    shouldSyncAura: false,
    shouldSyncPulse: false,
  });

  const setCursorSpeed = (speed: number) => {
    setEnergy((prev) => ({ ...prev, cursorSpeed: speed, isMoving: speed > 10 }));
  };

  const setIsIdle = (idle: boolean) => {
    setEnergy((prev) => ({ ...prev, isIdle: idle }));
  };

  const setIsMoving = (moving: boolean) => {
    setEnergy((prev) => ({ ...prev, isMoving: moving }));
  };

  const triggerSectionSync = () => {
    setEnergy((prev) => ({ 
      ...prev, 
      shouldSyncAura: true, 
      shouldSyncPulse: true 
    }));
    setTimeout(() => {
      setEnergy((prev) => ({ 
        ...prev, 
        shouldSyncAura: false, 
        shouldSyncPulse: false 
      }));
    }, 150);
  };

  // Idle detection - reduce glow after 2.5s
  useEffect(() => {
    let idleTimer: NodeJS.Timeout | undefined;
    
    if (energy.isMoving) {
      if (idleTimer) clearTimeout(idleTimer);
      setIsIdle(false);
    } else {
      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, 2500);
    }

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [energy.isMoving, setIsIdle]);

  return (
    <SipherEnergyContext.Provider
      value={{
        energy,
        setCursorSpeed,
        setIsIdle,
        setIsMoving,
        triggerSectionSync,
      }}
    >
      {children}
    </SipherEnergyContext.Provider>
  );
}

export function useSipherEnergy() {
  const context = useContext(SipherEnergyContext);
  if (context === undefined) {
    throw new Error("useSipherEnergy must be used within a SipherEnergyProvider");
  }
  return context;
}

