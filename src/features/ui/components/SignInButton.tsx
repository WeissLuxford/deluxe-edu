'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function SignInButton({ href, label }: { href: string; label: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('shine')
    const t = setTimeout(() => el.classList.remove('shine'), 2200)
    return () => clearTimeout(t)
  }, [])
  return (
    <Link ref={ref} href={href} className="iridescent vx" aria-label={label}>
      {label}
      <span className="drop-shadow" />
    </Link>
  )
}
