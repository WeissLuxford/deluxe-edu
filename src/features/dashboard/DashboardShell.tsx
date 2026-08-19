'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BookOpen, CheckCircle2, GraduationCap, ArrowRight } from 'lucide-react'
import { Avatar } from '@/features/ui/components/Avatar'
import TabsNav from './TabsNav'
import ProfileSection from './sections/ProfileSection'
import PaymentsSection from './sections/PaymentsSection'
import ProgressSection from './sections/ProgressSection'
import SubmissionsSection from './sections/SubmissionsSection'
import SettingsSection from './sections/SettingsSection'

type User = {
  id: string
  name: string | null
  email?: string | null
  image: string | null
  role: string
  locale: string
  createdAt: string | Date
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  emailVerified?: string | Date | null
}

export default function DashboardShell({
  user,
  coursesCount,
  payments,
  progress,
  submissions,
  locale
}: {
  user: User
  coursesCount: number
  payments: any[]
  progress: any[]
  submissions: any[]
  locale: string
}) {
  const t = useTranslations('dashboard')
  const tLearn = useTranslations('learn')
  const search = useSearchParams()
  const tab = search.get('tab') || 'profile'

  const lessonsDone = progress.filter(p => p.passed).length

  const stats = [
    { icon: BookOpen, label: t('statCourses'), value: coursesCount },
    { icon: CheckCircle2, label: t('statLessonsDone'), value: lessonsDone },
    { icon: GraduationCap, label: t('tabSubmissions'), value: submissions.length }
  ]

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <div className="dash-head">
            <Avatar name={user.name} seed={user.phone || user.id} image={user.image} size={72} />
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
        <TabsNav />

        {tab === 'profile' && <ProfileSection />}
        {tab === 'payments' && <PaymentsSection payments={payments} />}
        {tab === 'progress' && <ProgressSection rows={progress} locale={locale} />}
        {tab === 'submissions' && <SubmissionsSection rows={submissions} />}
        {tab === 'settings' && <SettingsSection user={user} />}
      </div>
    </main>
  )
}
