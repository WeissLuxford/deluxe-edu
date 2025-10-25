'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const locales = ['en','ru','uz']

export default function LangDropdown() {
  const pathname = usePathname() || '/'
  const parts = pathname.split('/')
  const current = locales.includes(parts[1]) ? parts[1] : 'en'
  const hrefFor = (l: string) => {
    const p = [...parts]
    if (locales.includes(p[1])) p[1] = l
    else p.splice(1, 0, l)
    return (p.join('/') || '/').replace(/\/+/g, '/')
  }

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [])

  const items = locales.filter(l => l !== current)

  return (
    <div ref={ref} className={`lang-root ${open ? 'open' : ''}`}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="lang-btn"
      >
        <span>{current.toUpperCase()}</span>
        <svg className="lang-caret" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div role="listbox" className={`lang-panel ${open ? 'open' : ''}`}>
        {items.map(l => (
          <Link
            key={l}
            href={hrefFor(l)}
            onClick={() => setOpen(false)}
            className="lang-item"
          >
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  )
}
