'use client'

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'

type Props = {
  as?: ElementType
  delay?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}

// Fades and lifts content in the first time it scrolls into view. The hidden
// state lives in base.css behind html.js, so server HTML is visible without JS.
export function Reveal({ as: Tag = 'div', delay = 0, className, style, children }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={{ ...style, ['--reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
