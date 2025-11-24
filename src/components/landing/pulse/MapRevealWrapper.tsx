'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface MapRevealWrapperProps {
  children: React.ReactNode
}

export default function MapRevealWrapper({ children }: MapRevealWrapperProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: 50,
      }}
      animate={{
        opacity: inView ? 1 : 0,
        y: inView ? 0 : 50,
      }}
      transition={{
        duration: 1.2,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}
