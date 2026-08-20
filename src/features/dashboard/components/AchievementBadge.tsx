import { Trophy, Lock } from 'lucide-react'
import registry from '@/content/achievements.json'
import { localized } from '@/lib/localized'
import type { AchievementId } from '../achievements'

type Entry = { src?: string; title: Record<string, string>; description: Record<string, string> }
const catalog = registry as unknown as Record<AchievementId, Entry>

export function AchievementBadge({
  id,
  earned,
  earnedAt,
  locale
}: {
  id: AchievementId
  earned: boolean
  earnedAt?: Date
  locale: string
}) {
  const entry = catalog[id]
  if (!entry) return null

  const title = localized(entry.title, locale)
  const description = localized(entry.description, locale)
  const src = entry.src?.trim()

  return (
    <div className={`achv-badge${earned ? ' is-earned' : ' is-locked'}`}>
      <span className="achv-badge__icon">
        {earned && src ? (
          <img src={src} alt={title} width={56} height={56} />
        ) : earned ? (
          <Trophy size={26} />
        ) : (
          <Lock size={22} />
        )}
      </span>
      <span className="achv-badge__title">{title}</span>
      <span className="achv-badge__desc">{description}</span>
      {earned && earnedAt && (
        <time className="achv-badge__date" dateTime={new Date(earnedAt).toISOString()}>
          {new Date(earnedAt).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </time>
      )}
    </div>
  )
}
