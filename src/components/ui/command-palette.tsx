'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Search,
  LogIn,
  User,
  Settings,
  FileText,
  MapPin,
  Zap,
  ArrowRight,
  X,
  Code2,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  group: string
}

export function CommandPalette() {
  const router = useRouter()
  const { commandPaletteOpen, setCommandPaletteOpen, setWaitlistModalOpen } = useUIStore()
  const [search, setSearch] = React.useState('')

  const commands: CommandItem[] = [
    {
      id: 'log-entry',
      label: 'Log new entry',
      icon: <Code2 className="w-4 h-4" />,
      shortcut: 'L',
      action: () => {
        router.push('/dashboard')
        setCommandPaletteOpen(false)
      },
      group: 'Actions',
    },
    {
      id: 'view-proofcard',
      label: 'View ProofCard',
      icon: <BarChart3 className="w-4 h-4" />,
      shortcut: 'P',
      action: () => {
        router.push('/dashboard?tab=proofcard')
        setCommandPaletteOpen(false)
      },
      group: 'Actions',
    },
    {
      id: 'join-waitlist',
      label: 'Join waitlist',
      icon: <Users className="w-4 h-4" />,
      shortcut: 'J',
      action: () => {
        setWaitlistModalOpen(true)
        setCommandPaletteOpen(false)
      },
      group: 'Actions',
    },
    {
      id: 'view-pulse',
      label: 'View India Pulse',
      icon: <MapPin className="w-4 h-4" />,
      shortcut: 'M',
      action: () => {
        router.push('/#pulse')
        setCommandPaletteOpen(false)
      },
      group: 'Navigation',
    },
    {
      id: 'view-roadmap',
      label: 'View Roadmap',
      icon: <TrendingUp className="w-4 h-4" />,
      shortcut: 'R',
      action: () => {
        router.push('/#roadmap')
        setCommandPaletteOpen(false)
      },
      group: 'Navigation',
    },
    {
      id: 'login',
      label: 'Login',
      icon: <LogIn className="w-4 h-4" />,
      shortcut: '⌘K',
      action: () => {
        router.push('/login')
        setCommandPaletteOpen(false)
      },
      group: 'Account',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <User className="w-4 h-4" />,
      shortcut: 'D',
      action: () => {
        router.push('/dashboard')
        setCommandPaletteOpen(false)
      },
      group: 'Account',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      shortcut: ',',
      action: () => {
        router.push('/settings')
        setCommandPaletteOpen(false)
      },
      group: 'Account',
    },
  ]

  // Filter commands based on search
  const filteredCommands = React.useMemo(() => {
    if (!search) return commands
    const lowerSearch = search.toLowerCase()
    return commands.filter(
      cmd =>
        cmd.label.toLowerCase().includes(lowerSearch) ||
        cmd.group.toLowerCase().includes(lowerSearch)
    )
  }, [search, commands])

  // Group commands
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.group]) {
        groups[cmd.group] = []
      }
      groups[cmd.group].push(cmd)
    })
    return groups
  }, [filteredCommands])

  // Keyboard shortcut handler
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl"
            >
              <Command
                className="rounded-2xl border border-white/10 bg-[#0B0B0C]/98 backdrop-blur-xl shadow-2xl overflow-hidden"
                shouldFilter={false}
              >
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Type a command or search..."
                    className="flex-1 bg-transparent text-white placeholder:text-muted-foreground outline-none"
                    autoFocus
                  />
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                    <span className="text-xs">ESC</span>
                  </kbd>
                </div>
                <Command.List className="max-h-[400px] overflow-y-auto p-2">
                  {Object.keys(groupedCommands).length === 0 ? (
                    <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                      No commands found.
                    </Command.Empty>
                  ) : (
                    Object.entries(groupedCommands).map(([group, items]) => (
                      <div key={group} className="mb-4">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group}
                        </div>
                        {items.map(cmd => (
                          <Command.Item
                            key={cmd.id}
                            onSelect={cmd.action}
                            className="group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white outline-none aria-selected:bg-white/10 aria-selected:text-white"
                          >
                            <div className="text-muted-foreground group-aria-selected:text-white">
                              {cmd.icon}
                            </div>
                            <span className="flex-1">{cmd.label}</span>
                            {cmd.shortcut && (
                              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                                {cmd.shortcut}
                              </kbd>
                            )}
                            <ArrowRight className="w-4 h-4 opacity-0 transition-opacity group-aria-selected:opacity-100" />
                          </Command.Item>
                        ))}
                      </div>
                    ))
                  )}
                </Command.List>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
