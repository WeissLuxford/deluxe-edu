import { ReactNode, type CSSProperties } from 'react'

type Props = {
  id?: string
  eyebrow?: string
  /** Decorative accent for this whole section: eyebrow pill, badges, card
   *  highlights. Published as --section-accent so anything inside can read it.
   *  Use one palette color per section — never the interactive --ui-accent. */
  accent?: string
  eyebrowAccent?: string
  title?: string
  subtitle?: string
  tone?: 'plain' | 'raised' | 'sunken'
  /** Backdrop texture. Neutral by construction (--border / --veil only), so it
   *  breaks up the page without adding color. */
  texture?: 'none' | 'grid' | 'dots' | 'wash'
  width?: 'narrow' | 'default' | 'wide'
  align?: 'left' | 'center'
  children: ReactNode
}

export function Section({
  id,
  eyebrow,
  accent,
  eyebrowAccent,
  title,
  subtitle,
  tone = 'plain',
  texture = 'none',
  width = 'default',
  align = 'center',
  children
}: Props) {
  const hasHead = Boolean(eyebrow || title || subtitle)

  return (
    <section
      id={id}
      data-tone={tone}
      data-texture={texture}
      style={accent ? ({ '--section-accent': accent } as CSSProperties) : undefined}
    >
      {texture !== 'none' && <span className={`deco-${texture}`} aria-hidden="true" />}

      <div data-width={width}>
        {hasHead && (
          <header
            data-align={align}
            style={eyebrowAccent ? ({ '--eyebrow-accent': eyebrowAccent } as CSSProperties) : undefined}
          >
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
