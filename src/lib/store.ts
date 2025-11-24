import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// UI State
interface UIState {
  waitlistModalOpen: boolean
  commandPaletteOpen: boolean
  activeTab: string
  uiDensity: 'compact' | 'comfortable'
  setWaitlistModalOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void
  setUIDensity: (density: 'compact' | 'comfortable') => void
}

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      waitlistModalOpen: false,
      commandPaletteOpen: false,
      activeTab: 'problem',
      uiDensity: 'comfortable',
      setWaitlistModalOpen: open => set({ waitlistModalOpen: open }),
      setCommandPaletteOpen: open => set({ commandPaletteOpen: open }),
      setActiveTab: tab => set({ activeTab: tab }),
      setUIDensity: density => set({ uiDensity: density }),
    }),
    {
      name: 'sipher-ui-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: state => ({
        uiDensity: state.uiDensity,
        activeTab: state.activeTab,
      }),
    }
  )
)

// User State (for authenticated users)
interface UserState {
  user: any | null
  setUser: (user: any | null) => void
}

export const useUserStore = create<UserState>(set => ({
  user: null,
  setUser: user => set({ user }),
}))
