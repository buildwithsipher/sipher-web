'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X } from 'lucide-react'

interface HelpTooltipProps {
  content: string | React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click'
  children?: React.ReactNode
  className?: string
}

export function HelpTooltip({
  content,
  position = 'top',
  trigger = 'hover',
  children,
  className = '',
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (trigger !== 'click') return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [trigger])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white/20 border-l-transparent border-r-transparent border-b-transparent',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-b-white/20 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white/20 border-t-transparent border-b-transparent border-r-transparent',
    right:
      'right-full top-1/2 -translate-y-1/2 border-r-white/20 border-t-transparent border-b-transparent border-l-transparent',
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
        onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
        onClick={() => trigger === 'click' && setIsOpen(!isOpen)}
        className="cursor-help"
        role="button"
        aria-label="Show help"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
      >
        {children || (
          <HelpCircle className="w-4 h-4 text-white/40 hover:text-white/60 transition-colors" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{
              opacity: 0,
              scale: 0.95,
              y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0,
            }}
            transition={{ duration: 0.2 }}
            className={`absolute ${positionClasses[position]} z-50 w-64 glass-card rounded-lg p-4 text-sm text-white/90 shadow-xl`}
            role="tooltip"
          >
            <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
            {trigger === 'click' && (
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
                aria-label="Close help"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="leading-relaxed">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
