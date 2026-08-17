import { ReactNode } from 'react'

type Props = {
  id?: string
  eyebrow?: string
  title?: string
  subtitle?: string
  tone?: 'plain' | 'raised' | 'accent'
  width?: 'narrow' | 'default' | 'wide'
  align?: 'left' | 'center'
  children: ReactNode
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  tone = 'plain',
  width = 'default',
  align = 'center',
  children
}: Props) {
  const hasHead = Boolean(eyebrow || title || subtitle)

  return (
    <section id={id} className={`vsection tone-${tone}`}>
      <div className={`vsection__inner width-${width}`}>
        {hasHead && (
          <header className={`vsection__head align-${align}`}>
            {eyebrow && <span className="vsection__eyebrow">{eyebrow}</span>}
            {title && <h2 className="vsection__title">{title}</h2>}
            {subtitle && <p className="vsection__sub">{subtitle}</p>}
          </header>
        )}

        {children}
      </div>
    </section>
  )
}
