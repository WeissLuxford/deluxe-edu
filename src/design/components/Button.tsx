import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import s from './Button.module.css'

type Variant = 'ink' | 'lime' | 'violet' | 'white' | 'soft' | 'ghost' | 'ghostOnInk'
type Size = 'sm' | 'md' | 'lg'

type Common = {
  variant?: Variant
  size?: Size
  /** Round arrow badge on the right — the main call to action on a screen. */
  arrow?: boolean
  /** Small lime dot after the label — a quieter accent. */
  dot?: boolean
  block?: boolean
  className?: string
  children: ReactNode
}

type AsLink = Common & { href: string; prefetch?: boolean }
type AsButton = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined }

export function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function Button(props: AsLink | AsButton) {
  const { variant = 'ink', size = 'md', arrow, dot, block, className, children } = props
  const cls = [s.btn, s[size], s[variant], arrow && s.withArrow, block && s.block, className].filter(Boolean).join(' ')
  const inner = (
    <>
      {children}
      {dot && <span className={s.dot} aria-hidden="true" />}
      {arrow && (
        <span className={s.arrow} aria-hidden="true">
          <ArrowIcon size={size === 'lg' ? 20 : 16} />
        </span>
      )}
    </>
  )

  if ('href' in props && props.href !== undefined) {
    return (
      <Link href={props.href} prefetch={(props as AsLink).prefetch} className={cls}>
        {inner}
      </Link>
    )
  }

  const { variant: _v, size: _s, arrow: _a, dot: _d, block: _b, className: _c, children: _ch, href: _h, ...rest } = props
  return (
    <button type="button" {...rest} className={cls}>
      {inner}
    </button>
  )
}
