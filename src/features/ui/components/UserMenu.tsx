'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'

export default function UserMenu() {
  const locale = useLocale()
  const t = useTranslations('common')
  const { data: session, status } = useSession()
  const base = `/${locale}`
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [override, setOverride] = useState<{ name?: string; email?: string } | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const btnId = 'user-menu-button'
  const menuId = 'user-menu-panel'

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('vertexUserOverride')
      if (raw) setOverride(JSON.parse(raw))
    } catch {}
    const handler = (e: Event) => {
      const ce = e as CustomEvent
      if (ce.detail) {
        setOverride({ name: ce.detail.name, email: ce.detail.email })
        try { sessionStorage.setItem('vertexUserOverride', JSON.stringify(ce.detail)) } catch {}
      }
    }
    window.addEventListener('vertex:user-updated', handler as EventListener)
    return () => window.removeEventListener('vertex:user-updated', handler as EventListener)
  }, [])

  const initials = useMemo(() => {
    const baseStr = override?.name || session?.user?.name || override?.email || session?.user?.email || ''
    const parts = baseStr.split(' ').filter(Boolean)
    const first = parts[0]?.[0] || baseStr[0] || 'U'
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
  }, [override, session])

  if (!hydrated || status === 'loading') {
    return <div className="user-skeleton" />
  }

  if (status !== 'authenticated') {
    return (
      <Link className="iridescent vx" aria-label={t('nav.signin')} href={`${base}/signin`}>
        {t('nav.signin')}
        <span className="drop-shadow" />
      </Link>
    )
  }

  const avatarSrc = session.user.image || '/brand/avatar-default.png'

  return (
    <div className="user-menu-root" ref={ref}>
      <button
        id={btnId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="avatar-btn"
        onClick={() => setOpen(v => !v)}
      >
        {session.user.image ? (
          <img src={avatarSrc} alt="" className="avatar-img" />
        ) : (
          <span className="avatar-fallback">{initials}</span>
        )}
      </button>

      <div
        id={menuId}
        role="menu"
        aria-labelledby={btnId}
        className={`menu-panel ${open ? 'open' : ''}`}
      >
        <Link
          href={`${base}/dashboard`}
          role="menuitem"
          className="menu-item menu-first"
          onClick={() => setOpen(false)}
        >
          {t('nav.dashboard')}
        </Link>
        <button
          role="menuitem"
          className="menu-item menu-last"
          onClick={() => {
            setOpen(false)
            signOut({ callbackUrl: base })
          }}
        >
          {t('nav.signout')}
        </button>
      </div>
    </div>
  )
}
