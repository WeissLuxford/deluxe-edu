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
    <section id={id} data-tone={tone}>
      <div data-width={width}>
        {hasHead && (
          <header data-align={align}>
            {eyebrow && <span>{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </header>
        )}

        {children}
      </div>
    </section>
  )
}
