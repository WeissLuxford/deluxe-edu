import { getTranslations } from 'next-intl/server'
import { AlarmClock } from 'lucide-react'
import { FREE_DAILY_LESSON_LIMIT } from '@/features/courses/dailyLimit'

export async function DailyLimitBanner({ locale, count }: { locale: string; count: number }) {
  const t = await getTranslations({ locale, namespace: 'learn' })

  return (
    <div className="daily-limit-banner">
      <AlarmClock size={18} />
      <div className="daily-limit-banner__body">
        <strong>{t('dailyLimitTitle')}</strong>
        <span>{t('dailyLimitText', { count, limit: FREE_DAILY_LESSON_LIMIT })}</span>
      </div>
    </div>
  )
}
