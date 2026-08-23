'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight, GraduationCap } from 'lucide-react'
import ThemeToggle from '@/features/ui/components/ThemeToggle'
import LangSwitcher from '@/features/ui/components/LangDropdown'
import UserMenu from '@/features/ui/components/UserMenu'
import { HighgateLogo } from '@/features/ui/components/HighgateLogo'

export type Crumb = { label: string; href?: string }

export function LearnTopbar({ locale, crumbs = [] }: { locale: string; crumbs?: Crumb[] }) {
  const t = useTranslations('learn')

  return (
    <header className="learn-topbar">
      <div className="learn-topbar__inner">
        <Link href={`/${locale}/learn`} className="learn-topbar__brand" aria-label={t('backToLearning')}>
          <HighgateLogo className="learn-topbar__logo" />
        </Link>

        <nav className="learn-crumbs" aria-label={t('backToLearning')}>
          <Link href={`/${locale}/learn`} className="learn-crumbs__root">
            <GraduationCap size={15} />
            <span>{t('backToLearning')}</span>
          </Link>
          {crumbs.map(crumb => (
            <span key={crumb.label} className="learn-crumbs__item">
              <ChevronRight size={14} className="learn-crumbs__sep" />
              {crumb.href ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span className="learn-crumbs__current">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="learn-topbar__actions">
          <div className="learn-topbar__reward" aria-hidden="true" />
          <ThemeToggle />
          <LangSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
