import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ActiveTabScroller } from './components/ActiveTabScroller'

const tabs = ['profile', 'courses', 'payments', 'submissions', 'achievements', 'settings'] as const
type TabKey = typeof tabs[number]

export async function TabsNav({ tab, basePath, locale }: { tab: string; basePath: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'dashboard' })
  const current = (tabs as readonly string[]).includes(tab) ? (tab as TabKey) : 'profile'

  const labelFor: Record<TabKey, string> = {
    profile: t('tabProfile'),
    courses: t('tabCourses'),
    payments: t('tabPayments'),
    submissions: t('tabSubmissions'),
    achievements: t('tabAchievements'),
    settings: t('tabSettings')
  }

  return (
    <div className="tabs">
      {tabs.map(k => {
        const link = (
          <Link
            href={`${basePath}?tab=${k}`}
            className={`tab${current === k ? ' tab-active' : ''}`}
            aria-current={current === k ? 'page' : undefined}
          >
            {labelFor[k]}
          </Link>
        )
        return current === k ? (
          <ActiveTabScroller key={k}>{link}</ActiveTabScroller>
        ) : (
          <span key={k} style={{ display: 'contents' }}>{link}</span>
        )
      })}
    </div>
  )
}
