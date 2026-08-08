'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { VertexLogo } from './VertexLogo_v2'

export default function SiteFooter() {
  const locale = useLocale()
  const t = useTranslations()
  const year = new Date().getFullYear()
  const base = `/${locale}`

  // Ссылки ведут с локалью: без неё /contact уводил на несуществующую
  // страницу (реальная называется /contacts), а middleware ещё и добавлял
  // редирект по дороге
  const navLinks = [
    { href: `${base}/courses`, label: t('nav.courses') },
    { href: `${base}/streams`, label: t('nav.streams') },
    { href: `${base}/about`, label: t('nav.about') },
    { href: `${base}/contacts`, label: t('nav.contacts') }
  ]

  const socialLinks = [
    { href: 'https://instagram.com/vertexedu', label: 'Instagram' },
    { href: 'https://youtube.com/@vertexedu', label: 'YouTube' },
    { href: 'https://facebook.com/vertexedu', label: 'Facebook' },
    { href: 'https://t.me/vertexedu', label: 'Telegram' }
  ]

  return (
    <footer className="vx-footer">
      <div className="vx-footer__container container">
        <div className="vx-footer__line" />
        <div className="vx-footer__top grid gap-8 pt-6">

          <div className="vx-footer__brand">
            <div className="vx-footer__logo">
              <VertexLogo className="vx-footer__logoImg h-[6rem] md:h-[9rem] lg:h-[11rem] w-auto" />
            </div>
            <div className="vx-footer__tagline">Learning. Elevated.</div>
          </div>

          <nav className="vx-footer__nav">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="vx-link vx-bracket">
                {l.label}
              </Link>
            ))}
          </nav>

          <nav className="vx-footer__social">
            {socialLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="vx-link vx-bracket"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="vx-footer__contacts">
            <div className="vx-contactRow">
              <div className="vx-contactKey">A</div>
              <div className="vx-contactVal">Vertex, Tashkent, UZ</div>
            </div>
            <div className="vx-contactRow">
              <div className="vx-contactKey">P</div>
              <div className="vx-contactVal">
                <a href="tel:+998901234567" className="vx-link">+998 90 123 45 67</a>
              </div>
            </div>
            <div className="vx-contactRow">
              <div className="vx-contactKey">E</div>
              <div className="vx-contactVal">
                <a href="mailto:hello@vertex.uz" className="vx-link underline">hello@vertex.uz</a>
              </div>
            </div>
          </div>

          <div className="vx-footer__meta">
            <div className="vx-footer__line" />
            <div className="vx-metaRow">
              <div className="vx-legal">
                <Link href={`${base}/privacy`} className="vx-link-quiet">{t('footer.privacy')}</Link>
                <Link href={`${base}/terms`} className="vx-link-quiet">{t('footer.terms')}</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="vx-footer__line mt-8" />
        <div className="vx-bar">
          <div className="vx-barLeft">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3l9 18H3z" fill="var(--gold)" />
            </svg>
            <span className="vx-brandName">Vertex</span>
          </div>
          <div className="vx-copy">© {year} Vertex Education</div>
        </div>
      </div>
    </footer>
  )
}
