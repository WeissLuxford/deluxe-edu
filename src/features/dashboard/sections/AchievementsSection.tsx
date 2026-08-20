import { ACHIEVEMENT_IDS } from '../achievements'
import { AchievementBadge } from '../components/AchievementBadge'

export function AchievementsSection({
  earned,
  locale
}: {
  earned: { achievementId: string; earnedAt: Date }[]
  locale: string
}) {
  const earnedMap = new Map(earned.map(e => [e.achievementId, e.earnedAt]))

  return (
    <div className="achv-grid">
      {ACHIEVEMENT_IDS.map(id => (
        <AchievementBadge key={id} id={id} earned={earnedMap.has(id)} earnedAt={earnedMap.get(id)} locale={locale} />
      ))}
    </div>
  )
}
