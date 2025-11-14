'use client'

import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import SipherAsterisk from '@/components/ui/SipherAsterisk'
import { asteriskVariants } from '@/lib/motion-variants'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  className?: string
}

export function Logo({ size = 'medium', animated = false, className }: LogoProps) {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-5xl md:text-6xl',
  }

  // Circle sizes - roughly half the height of the lowercase letters
  const circleSizes = {
    small: 14,
    medium: 18,
    large: 22,
  }

  // Asterisk sizes - nearly the same as circle size (fill the circle)
  const asteriskSizes = {
    small: 13,  // Almost fills the 14px circle
    medium: 17, // Almost fills the 18px circle
    large: 21,  // Almost fills the 22px circle
  }

  // Stroke width scales with size for better visibility
  const strokeWidths = {
    small: 2,
    medium: 2.5,
    large: 3,
  }

  return (
    <div className={cn('flex items-center', className)}>
      <span className={cn(
        'font-black tracking-tight text-black dark:text-white relative inline-block lowercase',
        'font-sans', // Sans-serif for clean, bold look
        sizeClasses[size]
      )}>
        sipher
        {/* Asterisk in solid circle - positioned to upper right of 'r', slightly above baseline */}
        <span 
          className="absolute inline-flex items-center justify-center rounded-full bg-black dark:bg-white transition-colors"
          style={{ 
            left: 'calc(100% + 4px)',
            top: '-0.15em', // Slightly above baseline
            width: `${circleSizes[size]}px`,
            height: `${circleSizes[size]}px`,
          }}
        >
          {animated ? (
            <motion.span
              className="sipher-ast-life"
              variants={asteriskVariants as Variants}
              initial="idle"
              whileHover="hover"
            >
              <SipherAsterisk 
                size={asteriskSizes[size]} 
                color="white" 
                className="dark:invert"
                strokeWidth={strokeWidths[size]}
                ariaHidden={true}
              />
            </motion.span>
          ) : (
            <span className="sipher-ast-life">
              <SipherAsterisk 
                size={asteriskSizes[size]} 
                color="white" 
                className="dark:invert"
                strokeWidth={strokeWidths[size]}
                ariaHidden={true}
              />
            </span>
          )}
        </span>
      </span>
    </div>
  )
}

