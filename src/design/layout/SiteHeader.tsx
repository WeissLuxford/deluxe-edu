'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { Logo } from '../components/Bits'
import s from './SiteHeader.module.css'

const LOCALES = ['ru', 'uz', 'en'] as const

function swapLocale(pathname: string, next: string) {
  const parts = pathname.split('/')
  if ((LOCALES as readonly string[]).includes(parts[1])) parts[1] = next
  else parts.splice(1, 0, next)
  return parts.join('/') || `/${next}`
}

export function SiteHeader() {
  const t = useTranslations('siteNav')
  const locale = useLocale()
  const pathname = usePathname() || `/${locale}`
  const { status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const base = `/${locale}`

  const links = [
    { href: `${base}/courses`, label: t('courses') },
    { href: `${base}/teachers`, label: t('teachers') },
    { href: `${base}/results`, label: t('results') },
    { href: `${base}/about`, label: t('about') }
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setLangOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!langOpen) return
    const onDown = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLangOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [langOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const signedIn = status === 'authenticated'
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className={[s.wrap, scrolled && s.scrolled].filter(Boolean).join(' ')}>
      <div className={s.bar}>
        <Logo href={base} />

        <nav className={s.nav} aria-label={t('menu')}>
          {links.map(link => (
            <Link key={link.href} href={link.href} className={[s.link, isActive(link.href) && s.linkActive].filter(Boolean).join(' ')} aria-current={isActive(link.href) ? 'page' : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={s.right}>
          <div ref={langRef} className={s.lang}>
            <button type="button" className={s.langBtn} aria-haspopup="menu" aria-expanded={langOpen} aria-label={t('language')} onClick={() => setLangOpen(v => !v)}>
              {locale.toUpperCase()}
            </button>
            <div className={[s.langMenu, langOpen && s.langMenuOpen].filter(Boolean).join(' ')} role="menu">
              {LOCALES.map(l => (
                <Link key={l} href={swapLocale(pathname, l)} role="menuitem" className={[s.langItem, l === locale && s.langItemActive].filter(Boolean).join(' ')} hrefLang={l}>
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          <Link href={signedIn ? `${base}/learn` : `${base}/signin`} className={s.signin}>
            {signedIn ? t('myLearning') : t('signin')}
          </Link>
          <Link href={`${base}/trial-lesson`} className={s.cta}>
            {t('start')}
            <span className={s.ctaDot} aria-hidden="true" />
          </Link>
          <button type="button" className={s.burger} aria-label={menuOpen ? t('close') : t('menu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
            <span className={[s.burgerLines, menuOpen && s.burgerOpen].filter(Boolean).join(' ')} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={[s.sheet, menuOpen && s.sheetOpen].filter(Boolean).join(' ')} aria-hidden={!menuOpen}>
        <nav className={s.sheetNav}>
          {links.map((link, i) => (
            <Link key={link.href} href={link.href} className={s.sheetLink} style={{ transitionDelay: menuOpen ? `${60 + i * 40}ms` : '0ms' }} tabIndex={menuOpen ? 0 : -1}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={s.sheetFoot}>
          <div className={s.sheetLangs}>
            {LOCALES.map(l => (
              <Link key={l} href={swapLocale(pathname, l)} className={[s.sheetLang, l === locale && s.sheetLangActive].filter(Boolean).join(' ')} tabIndex={menuOpen ? 0 : -1}>
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link href={`${base}/trial-lesson`} className={s.sheetCta} tabIndex={menuOpen ? 0 : -1}>
            {t('start')}
          </Link>
        </div>
      </div>
    </header>
  )
}
