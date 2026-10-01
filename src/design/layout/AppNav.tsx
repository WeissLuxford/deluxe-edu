'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { CONTACTS } from '@/content/contacts'
import { Logo } from '../components/Bits'
import s from './app.module.css'

export type AppSection = 'today' | 'courses' | 'live' | 'tasks' | 'profile'

const ICONS: Record<AppSection, ReactNode> = {
  today: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  ),
  courses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5zM20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5z" />
    </svg>
  ),
  live: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="13" height="12" rx="3" />
      <path d="M16 10.5l5-3v9l-5-3" />
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0115 0" />
    </svg>
  )
}

type Item = { id: AppSection; href: string; badge?: number }

function useItems(coursesHref: string, badges: Partial<Record<AppSection, number>>): Item[] {
  const locale = useLocale()
  const base = `/${locale}`
  return [
    { id: 'today', href: `${base}/learn` },
    { id: 'courses', href: coursesHref },
    { id: 'live', href: `${base}/streams`, badge: badges.live },
    { id: 'tasks', href: `${base}/learn/tasks`, badge: badges.tasks },
    { id: 'profile', href: `${base}/learn/account` }
  ]
}

/** Which section a path belongs to — /learn/[slug]/… is "my courses". */
function sectionOf(pathname: string): AppSection {
  const parts = pathname.split('/').filter(Boolean)
  const [, zone, sub] = parts
  if (zone === 'streams') return 'live'
  if (zone === 'learn' && sub === 'tasks') return 'tasks'
  if ((zone === 'learn' && sub === 'account') || zone === 'account') return 'profile'
  if (zone === 'learn' && sub) return 'courses'
  return 'today'
}

type NavProps = { coursesHref: string; badges?: Partial<Record<AppSection, number>> }

// Desktop sidebar. The active item is white and runs into the white panel;
// two radial-gradient squares above and below it draw the curved cut-out.
export function AppSidebar({ coursesHref, badges = {} }: NavProps) {
  const t = useTranslations('appNav')
  const locale = useLocale()
  const active = sectionOf(usePathname() || '')
  const items = useItems(coursesHref, badges)

  return (
    <aside className={s.sidebar}>
      <Logo href={`/${locale}/learn`} ring="#e6e0fa" />
      <nav className={s.nav} aria-label={t('nav')}>
        {items.map(item => {
          const on = item.id === active
          return (
            <Link key={item.id} href={item.href} className={[s.navItem, on && s.navOn].filter(Boolean).join(' ')} aria-current={on ? 'page' : undefined}>
              <span className={s.navIcon}>{ICONS[item.id]}</span>
              {t(item.id)}
              {item.badge ? <span className={s.navBadge}>{item.badge}</span> : null}
            </Link>
          )
        })}
      </nav>
      <div className={s.help}>
        <span className={s.helpTitle}>{t('stuckTitle')}</span>
        <span className={s.helpText}>{t('stuckText')}</span>
        <a href={`https://t.me/${CONTACTS.telegram}`} target="_blank" rel="noreferrer" className={s.helpBtn}>
          {t('write')}
        </a>
      </div>
      <button type="button" className={s.signout} onClick={() => signOut({ callbackUrl: `/${locale}` })}>
        {t('signout')}
      </button>
    </aside>
  )
}

/** Phone tab bar: a dark floating pill, the active tab lights up lime. */
export function AppTabBar({ coursesHref, badges = {} }: NavProps) {
  const t = useTranslations('appNav')
  const active = sectionOf(usePathname() || '')
  const items = useItems(coursesHref, badges).filter(item => item.id !== 'tasks')

  return (
    <nav className={s.tabbar} aria-label={t('nav')}>
      {items.map(item => {
        const on = item.id === active
        return (
          <Link key={item.id} href={item.href} className={[s.tab, on && s.tabOn].filter(Boolean).join(' ')} aria-current={on ? 'page' : undefined}>
            {ICONS[item.id]}
            <span>{item.id === 'courses' ? t('coursesShort') : t(item.id)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
