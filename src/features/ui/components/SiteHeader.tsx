'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import ThemeToggle from './ThemeToggle'
import LangSwitcher from './LangDropdown'
import VerifyBanner from './VerifyBanner'
import { VertexLogo } from './VertexLogo'
import UserMenu from './UserMenu'
import { useEffect, useState } from 'react'

export default function SiteHeader() {
  const locale = useLocale()
  const t = useTranslations('common')
  const pathname = usePathname()
  const search = useSearchParams()
  const { data: session, status } = useSession()
  const base = `/${locale}`
  const [bannerVisible, setBannerVisible] = useState(false)

  const navItems = [
    { href: `${base}/courses`, label: t('nav.courses') },
    { href: `${base}/streams`, label: t('nav.streams') },
    { href: `${base}/about`, label: t('nav.about') },
    { href: `${base}/contacts`, label: t('nav.contacts') }
  ]

  useEffect(() => {
    const isAuthenticated = status === 'authenticated'
    
    // Если не залогинен - баннер НЕ показываем
    if (!isAuthenticated) {
      setBannerVisible(false)
      return
    }
    
    // Проверяем только для залогиненных пользователей (используем phoneVerified вместо emailVerified)
    const phoneNotVerified = session?.user && !session.user.phoneVerified
    
    setBannerVisible(!!phoneNotVerified)
    
    if (phoneNotVerified) {
      const timer = setTimeout(() => setBannerVisible(false), 7000)
      return () => clearTimeout(timer)
    }
  }, [search, session, status])

  // 👈 КЛЮЧЕВОЕ: НЕ рендерим баннер вообще, если он не нужен
  const shouldRenderBanner = status === 'authenticated' && session?.user && !session.user.phoneVerified

  return (
    <header className="site-header relative">

      <nav className="site-nav container flex items-center justify-between py-3">
        <Link href={base} className="logo-link">
          <VertexLogo className="h-7 w-auto" />
        </Link>

        <ul className="nav-list flex gap-6">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link href={item.href} className={`nav-link${active ? ' active' : ''}`}>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="header-actions flex items-center gap-4">
          <ThemeToggle />
          <LangSwitcher />
          <UserMenu />
        </div>
      </nav>
          <VerifyBanner />
    </header>
    
  )
}