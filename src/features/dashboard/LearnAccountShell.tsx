import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { BookOpen, CheckCircle2, Trophy, Flame, ArrowRight } from 'lucide-react'
import { Avatar } from '@/features/ui/components/Avatar'
import { AvatarPicker } from './components/AvatarPicker'
import { TabsNav } from './TabsNav'
import ProfileSection from './sections/ProfileSection'
import { CoursesSection } from './sections/CoursesSection'
import { PaymentsSection } from './sections/PaymentsSection'
import { SubmissionsSection } from './sections/SubmissionsSection'
import { AchievementsSection } from './sections/AchievementsSection'
import { SettingsSection } from './sections/SettingsSection'
import { ACHIEVEMENT_IDS } from './achievements'
import type { LearnAccountData } from './getLearnAccountData'

export async function LearnAccountShell({
  data,
  tab,
  locale,
  currentDeviceId
}: {
  data: LearnAccountData
  tab: string
  locale: string
  currentDeviceId: string | null
}) {
  const { user } = data
  const t = await getTranslations({ locale, namespace: 'dashboard' })
  const tLearn = await getTranslations({ locale, namespace: 'learn' })
  const basePath = `/${locale}/learn/account`

  const stats = [
    { icon: BookOpen, label: t('statCourses'), value: data.courseTrees.length },
    { icon: CheckCircle2, label: t('statLessonsDone'), value: data.lessonsPassedCount },
    { icon: Trophy, label: t('statAchievements'), value: `${data.earned.length}/${ACHIEVEMENT_IDS.length}` },
    { icon: Flame, label: t('statStreak'), value: data.streakDays }
  ]

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <div className="dash-head">
            <span className="avatar-frame">
              <Avatar name={user.name} seed={user.phone || user.id} image={user.image} avatarSkinId={user.avatarSkinId} size={72} />
              <AvatarPicker seed={user.phone || user.id} name={user.name} avatarSkinId={user.avatarSkinId} locale={locale} />
            </span>
            <div>
              <h1 className="page-hero__title dash-head__title">
                {t('welcome', { name: user.firstName || user.name || '' })}
              </h1>
              <p className="page-hero__sub">{user.phone ? `+${user.phone}` : ''}</p>
            </div>
          </div>

          <div className="dash-stats">
            {stats.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="dash-stat">
                  <span className="dash-stat__icon">
                    <Icon size={16} />
                  </span>
                  <span className="dash-stat__value">{s.value}</span>
                  <span className="dash-stat__label">{s.label}</span>
                </div>
              )
            })}

            <Link href={`/${locale}/learn`} className="dash-stat dash-stat--link">
              <span className="dash-stat__icon">
                <ArrowRight size={16} />
              </span>
              <span className="dash-stat__label">{tLearn('backToLearning')}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container page-body">
        <TabsNav tab={tab} basePath={basePath} locale={locale} />

        {tab === 'profile' && <ProfileSection />}
        {tab === 'courses' && <CoursesSection trees={data.courseTrees} locale={locale} />}
        {tab === 'payments' && <PaymentsSection payments={data.payments} locale={locale} />}
        {tab === 'submissions' && <SubmissionsSection rows={data.submissions} locale={locale} />}
        {tab === 'achievements' && <AchievementsSection earned={data.earned} locale={locale} />}
        {tab === 'settings' && (
          <SettingsSection user={user} devices={data.devices} currentDeviceId={currentDeviceId} locale={locale} />
        )}
      </div>
    </main>
  )
}
