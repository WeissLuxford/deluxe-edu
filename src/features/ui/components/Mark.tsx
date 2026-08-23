import type { ReactNode } from 'react'

type MarkProps = {
  children: ReactNode
  color?: 'brand' | 'success' | 'danger' | 'info' | 'violet'
}

export function Mark({ children, color = 'brand' }: MarkProps) {
  return (
    <mark className="hg-mark" data-color={color}>
      {children}
    </mark>
  )
}
