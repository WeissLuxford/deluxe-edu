'use client'

import { useEffect, useRef } from 'react'

export function ActiveTabScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [])

  return <span ref={ref} style={{ display: 'contents' }}>{children}</span>
}
