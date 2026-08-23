'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

type RevealProps = {
  delay?: number
  y?: number
  x?: number
  as?: 'div' | 'li' | 'form'
} & HTMLMotionProps<'div'>

export function Reveal({ delay = 0, y = 20, x = 0, as = 'div', ...rest }: RevealProps) {
  const MotionTag = (as === 'li' ? motion.li : as === 'form' ? motion.form : motion.div) as typeof motion.div
  return (
    <MotionTag
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    />
  )
}
