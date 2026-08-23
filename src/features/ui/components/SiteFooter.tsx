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
    <footer>
      <div>
        <div>
          <HighgateLogoBordered />
          <div>Learning. Elevated.</div>
        </div>

        <nav>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <nav>
          {socialLinks.map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
              <l.Icon size={15} strokeWidth={1.7} />
              {l.label}
            </a>
          ))}
        </nav>

        <div>
          <div>
            <span>A</span>
            <span>Highgate, Tashkent, UZ</span>
          </div>
          <div>
            <span>P</span>
            <a href="tel:+998901234567">+998 90 123 45 67</a>
          </div>
        </div>

        <div>
          <Link href={`${base}/privacy`}>{t('footer.privacy')}</Link>
          <Link href={`${base}/terms`}>{t('footer.terms')}</Link>
        </div>

        <div>
          <span>Highgate</span>
          <span>© {year} Highgate Education</span>
        </div>
      </div>
    </footer>
  )
}
