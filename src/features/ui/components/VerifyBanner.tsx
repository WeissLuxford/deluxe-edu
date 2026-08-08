'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'

const LS_KEY = 'vx_verify_banner_dismissed_until'

export default function VerifyBanner() {
  const t = useTranslations('common')
  const locale = useLocale()
  const { data: session, status } = useSession()
  const base = `/${locale}`
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  const hasAccount = status === 'authenticated' && !!session?.user
  const unverified = hasAccount && !(session?.user as any)?.emailVerified

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!unverified) {
      setOpen(false)
      return
    }
    try {
      const until = parseInt(localStorage.getItem(LS_KEY) || '0', 10)
      const now = Date.now()
      if (!until || now > until) {
        const t = setTimeout(() => setOpen(true), 150)
        return () => clearTimeout(t)
      } else {
        setOpen(false)
      }
    } catch {
      setOpen(true)
    }
  }, [mounted, unverified])

  const close = () => {
    setOpen(false)
    try {
      const until = Date.now() + 24 * 60 * 60 * 1000
      localStorage.setItem(LS_KEY, String(until))
    } catch {}
  }

  if (!mounted) return null
  if (!unverified) return null

  return (
    <div className="verify-banner-container" aria-hidden={!open}>
      <div className={`verify-banner ${open ? 'open' : ''}`}>
        <div className="container verify-banner-inner">
          <span className="verify-banner-text">{t('auth.verifyBanner')}</span>
          <div className="verify-banner-actions">
            <Link href={`${base}/resend-verification`} className="auth-link">{t('auth.resend')}</Link>
            <button aria-label="Close" className="verify-banner-close" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
