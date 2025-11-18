'use client'

import { cn } from '@/lib/utils'

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

  return (
    <div className={cn('flex items-center', className)}>
      <span 
        className={cn(
          'font-black tracking-tight text-white lowercase',
          'font-sans',
          sizeClasses[size]
        )}
        style={{ letterSpacing: '-0.05em' }}
      >
        sipher<span className="text-purple-400">*</span>
      </span>
    </div>
  )
}

