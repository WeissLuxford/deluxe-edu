'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Menu, Send, X } from 'lucide-react'
import LangSwitcher from './LangDropdown'
import VerifyBanner from './VerifyBanner'
import { HighgateLogo } from './HighgateLogo'
import UserMenu from './UserMenu'
import { HeaderLeadModal } from './HeaderLeadModal'
import { useEffect, useState } from 'react'

export default function SiteHeader() {
  const locale = useLocale()
  const t = useTranslations()
  const pathname = usePathname()
  const search = useSearchParams()
  const { data: session, status } = useSession()
  const base = `/${locale}`
  const [bannerVisible, setBannerVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [leadModalOpen, setLeadModalOpen] = useState(false)

  const navItems = [
    { href: `${base}/courses`, label: t('nav.courses') },
    { href: `${base}/streams`, label: t('nav.streams') },
    { href: `${base}/news`, label: t('nav.news') },
    { href: `${base}/about`, label: t('nav.about') },
    { href: `${base}/contacts`, label: t('nav.contacts') }
  ]

  useEffect(() => {
    const isAuthenticated = status === 'authenticated'

    if (!isAuthenticated) {
      setBannerVisible(false)
      return
    }

    const phoneNotVerified = session?.user && !session.user.phoneVerified
    setBannerVisible(!!phoneNotVerified)

    if (phoneNotVerified) {
      const timer = setTimeout(() => setBannerVisible(false), 7000)
      return () => clearTimeout(timer)
    }
  }, [search, session, status])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onEsc)

    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onEsc)
    }
  }, [menuOpen])

  return (
    <>
      <header className="site-header">
        <div className="container">
          <nav className="site-nav">
            <Link href={base} className="logo-link">
              <HighgateLogo />
            </Link>

            <ul className="nav-list">
              {navItems.map(item => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`nav-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="header-actions">
              <button type="button" className="header-cta" onClick={() => setLeadModalOpen(true)}>
                <span className="cta-text">{t('nav.headerCta')}</span>
                <span className="cta-dot">
                  <Send size={14} />
                </span>
              </button>
              <LangSwitcher />
              <UserMenu />
            </div>

            <button
              type="button"
              className="burger-btn"
              aria-label="Меню"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(v => !v)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </nav>
        </div>

        <VerifyBanner />
      </header>

      <div className={`mobile-menu-backdrop${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />
      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <button type="button" className="mobile-menu-close" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)}>
          <X size={22} />
        </button>

        <ul className="mobile-menu-list">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`mobile-menu-link${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          className="header-cta header-cta--mobile"
          onClick={() => {
            setMenuOpen(false)
            setLeadModalOpen(true)
          }}
        >
          <span className="cta-text">{t('nav.headerCta')}</span>
          <span className="cta-dot">
            <Send size={14} />
          </span>
        </button>

        <div className="mobile-menu-actions">
          <LangSwitcher />
          <UserMenu />
        </div>
      </div>

      {leadModalOpen && <HeaderLeadModal onClose={() => setLeadModalOpen(false)} />}
    </>
  )
}
