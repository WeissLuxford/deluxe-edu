'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BookOpen, CheckCircle2, Loader, GraduationCap } from 'lucide-react'
import { Avatar } from '@/features/ui/components/Avatar'
import TabsNav from './TabsNav'
import ProfileSection from './sections/ProfileSection'
import CoursesSection from './sections/CoursesSection'
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
  passwordTail?: string | null
}

export type DashboardCourse = {
  enrollmentId: string
  plan: string
  id: string
  slug: string
  title: any
  description: any
  level: string
  priceBasic: number
  pricePro: number
  priceDeluxe: number
  total: number
  done: number
  completed: boolean
  resumeSlug: string | null
}

export default function DashboardShell({
  user,
  courses,
  payments,
  progress,
  submissions,
  locale
}: {
  user: User
  courses: DashboardCourse[]
  payments: any[]
  progress: any[]
  submissions: any[]
  locale: string
}) {
  const t = useTranslations('dashboard')
  const search = useSearchParams()
  const tab = search.get('tab') || 'profile'

  const lessonsDone = progress.filter(p => p.passed).length
  const inProgress = courses.filter(c => !c.completed).length
  const completed = courses.filter(c => c.completed).length

  const stats = [
    { icon: BookOpen, label: t('statCourses'), value: courses.length },
    { icon: CheckCircle2, label: t('statLessonsDone'), value: lessonsDone },
    { icon: Loader, label: t('statInProgress'), value: inProgress },
    { icon: GraduationCap, label: t('statCompleted'), value: completed }
  ]

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <div className="dash-head">
            <Avatar
              name={user.name}
              seed={user.phone || user.id}
              image={user.image}
              size={72}
            />
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
          </div>
        </div>
      </div>

      <div className="container page-body">
        <TabsNav />

        {tab === 'profile' && <ProfileSection />}
        {tab === 'courses' && <CoursesSection courses={courses} locale={locale} />}
        {tab === 'payments' && <PaymentsSection payments={payments} />}
        {tab === 'progress' && <ProgressSection rows={progress} locale={locale} />}
        {tab === 'submissions' && <SubmissionsSection rows={submissions} />}
        {tab === 'settings' && <SettingsSection user={user} />}
      </div>
    </main>
  )
}
