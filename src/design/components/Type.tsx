import type { CSSProperties, ElementType, ReactNode } from 'react'
import s from './Type.module.css'

type HeadingProps = {
  as?: ElementType
  size?: 'display' | 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function Heading({ as, size = 'h2', className, style, children }: HeadingProps) {
  const Tag = as ?? (size === 'display' || size === 'h1' ? 'h1' : size === 'h4' ? 'h3' : 'h2')
  return (
    <Tag className={[s.heading, s[size], className].filter(Boolean).join(' ')} style={style}>
      {children}
    </Tag>
  )
}

/** Warm italic serif — one or two words of a heading, never a paragraph. */
export function Serif({ children }: { children: ReactNode }) {
  return <span className="it">{children}</span>
}

/** Lime highlighter stroke. */
export function Marker({ children }: { children: ReactNode }) {
  return <span className="hl">{children}</span>
}

export function Lead({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <p className={[s.lead, className].filter(Boolean).join(' ')} style={style}>
      {children}
    </p>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className={s.eyebrow}>{children}</span>
}

export function Container({ children, className, style, as: Tag = 'div' }: { children: ReactNode; className?: string; style?: CSSProperties; as?: ElementType }) {
  return (
    <Tag className={[s.container, className].filter(Boolean).join(' ')} style={style}>
      {children}
    </Tag>
  )
}
