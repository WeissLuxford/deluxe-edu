import type { ReactNode } from 'react'

type TooltipProps = {
  tip: string
  pos?: 'top' | 'bottom' | 'left' | 'right'
  variant?: 'accent' | 'danger' | 'info'
  inline?: boolean
  children: ReactNode
}

export function Tooltip({ tip, pos, variant, inline, children }: TooltipProps) {
  return (
    <span
      className={`hg-tooltip${inline ? ' hg-tooltip--inline' : ''}`}
      data-tip={tip}
      data-pos={pos}
      data-variant={variant}
      tabIndex={0}
    >
      {children}
    </span>
  )
}
