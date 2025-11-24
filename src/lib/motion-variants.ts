/**
 * Framer Motion variants for Sipher asterisk animations
 */

export const asteriskVariants = {
  idle: { scale: 1, rotate: 0, opacity: 1 },
  hover: {
    scale: 1.08,
    rotate: 8,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  cta: {
    scale: 1.18,
    rotate: 12,
    opacity: 1,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
  pulse: {
    scale: [1, 1.06, 1],
    opacity: [1, 0.95, 1],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
}
