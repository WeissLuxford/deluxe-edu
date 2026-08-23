'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Instagram, Youtube, Facebook, Send } from 'lucide-react'
import { HighgateLogoBordered } from './HighgateLogoBordered'

export default function SiteFooter() {
  const locale = useLocale()
  const t = useTranslations()
  const year = new Date().getFullYear()
  const base = `/${locale}`

  const navLinks = [
    { href: `${base}/courses`, label: t('nav.courses') },
    { href: `${base}/streams`, label: t('nav.streams') },
    { href: `${base}/about`, label: t('nav.about') },
    { href: `${base}/contacts`, label: t('nav.contacts') }
  ]

  const socialLinks = [
    { href: 'https://instagram.com/hge', label: 'Instagram', Icon: Instagram },
    { href: 'https://youtube.com/@hge', label: 'YouTube', Icon: Youtube },
    { href: 'https://facebook.com/hge', label: 'Facebook', Icon: Facebook },
    { href: 'https://t.me/hge', label: 'Telegram', Icon: Send }
  ]

  return (
    <footer className="vx-footer">
      <div className="container vx-footer__container">
        <div className="vx-footer__top">
          <div className="vx-footer__brand">
            <div className="vx-footer__logo">
              <HighgateLogoBordered />
            </div>
            <span className="vx-footer__tagline">Learning. Elevated.</span>
          </div>

          <nav className="vx-footer__nav">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="vx-link-quiet">
                {l.label}
              </Link>
            ))}
          </nav>

          <nav className="vx-footer__social">
            {socialLinks.map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="vx-link-quiet">
                <l.Icon size={15} strokeWidth={1.7} />
                {l.label}
              </a>
            ))}
          </nav>

          <div className="vx-footer__contacts">
            <div className="vx-contactRow">
              <span className="vx-contactKey">A</span>
              <span className="vx-contactVal">Highgate, Tashkent, UZ</span>
            </div>
            <div className="vx-contactRow">
              <span className="vx-contactKey">P</span>
              <a className="vx-contactVal vx-link-quiet" href="tel:+998901234567">
                +998 90 123 45 67
              </a>
            </div>
          </div>

          <div className="vx-footer__meta">
            <div className="vx-legal">
              <Link href={`${base}/privacy`} className="vx-link-quiet">
                {t('footer.privacy')}
              </Link>
              <Link href={`${base}/terms`} className="vx-link-quiet">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>

        <div className="vx-footer__line" />

        <div className="vx-bar">
          <div className="vx-barLeft">
            <span className="vx-brandName">Highgate</span>
          </div>
          <span className="vx-copy">© {year} Highgate Education</span>
        </div>
      </div>
    </footer>
  )
}
