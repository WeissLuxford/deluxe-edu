'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'

const tabs = ['profile','courses','payments'] as const
type TabKey = typeof tabs[number]

export default function TabsNav() {
  const t = useTranslations('common')
  const locale = useLocale()
  const pathname = usePathname()
  const search = useSearchParams()
  const current = (search.get('tab') as TabKey) || 'profile'
  const hrefFor = (key: TabKey) => {
    const url = new URL(pathname || '/', 'http://x')
    url.searchParams.set('tab', key)
    return `${url.pathname}${url.search}${url.hash}`.replace('http://x','')
  }

  return (
    <div className="tabs">
      {tabs.map(k => (
        <Link
          key={k}
          href={hrefFor(k)}
          className={`tab${current === k ? ' tab-active' : ''}`}
          aria-current={current === k ? 'page' : undefined}
        >
          {k === 'profile' && t('dashboard.tabProfile')}
          {k === 'courses' && t('dashboard.tabCourses')}
          {k === 'payments' && t('dashboard.tabPayments')}
        </Link>
      ))}
    </div>
  )
}
