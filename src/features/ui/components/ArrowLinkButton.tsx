import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type Props = {
  href: string
  children: ReactNode
  tone?: 'default' | 'invert'
  className?: string
}

export function ArrowLinkButton({ href, children, tone = 'default', className }: Props) {
  return (
    <Link
      href={href}
      className={`arrow-link-btn${className ? ` ${className}` : ''}`}
      data-tone={tone}
    >
      <span>{children}</span>
      <span className="arrow-link-btn__icon" aria-hidden>
        <ArrowUpRight size={14} />
      </span>
    </Link>
  )
}
