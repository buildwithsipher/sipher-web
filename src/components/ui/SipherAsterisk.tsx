'use client'

import React from 'react'
import { motion, MotionProps } from 'framer-motion'

type AsteriskProps = {
  size?: number | string
  color?: string
  strokeWidth?: number
  className?: string
  animated?: boolean
  ariaLabel?: string
  ariaHidden?: boolean
} & MotionProps

export const SipherAsterisk: React.FC<AsteriskProps> = ({
  size = 32,
  color = 'currentColor',
  strokeWidth = 3.6,
  className = '',
  animated = false,
  ariaLabel = 'Sipher asterisk',
  ariaHidden = true,
  ...motionProps
}) => {
  const Svg = (
    <svg
      viewBox="-24 -24 48 48"
      width={size}
      height={size}
      role={ariaHidden ? 'none' : 'img'}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 5-stroke asterisk - evenly spaced at 72 degree intervals (360/5 = 72) */}
        {/* Rotated -54 degrees to make it upright (typical asterisk orientation) */}
        <line x1="0" y1="-12" x2="0" y2="12" transform="rotate(-54)" />
        <line x1="0" y1="-12" x2="0" y2="12" transform="rotate(18)" />
        <line x1="0" y1="-12" x2="0" y2="12" transform="rotate(90)" />
        <line x1="0" y1="-12" x2="0" y2="12" transform="rotate(162)" />
        <line x1="0" y1="-12" x2="0" y2="12" transform="rotate(234)" />
      </g>
    </svg>
  )

  // Simple fallback: static svg if animated === false
  if (!animated) return <>{Svg}</>

  // Animated version using framer-motion wrapper
  return (
    <motion.span
      style={{ display: 'inline-block', lineHeight: 0 }}
      initial={{ scale: 0.94, rotate: 0, opacity: 0.98 }}
      animate={{
        scale: [0.96, 1.02, 0.98],
        rotate: [0, 6, 0],
        opacity: [0.95, 1, 0.97],
      }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      {...motionProps}
    >
      {Svg}
    </motion.span>
  )
}

export default SipherAsterisk
