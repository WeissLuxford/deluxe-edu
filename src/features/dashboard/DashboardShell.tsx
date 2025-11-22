// src/features/dashboard/DashboardShell.tsx
'use client'

import { useSearchParams } from 'next/navigation'
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

export default function DashboardShell({
  user,
  enrollments,
  payments,
  progress,
  submissions
}: {
  user: User
  enrollments: any[]
  payments: any[]
  progress: any[]
  submissions: any[]
}) {
  const search = useSearchParams()
  const tab = search.get('tab') || 'profile'

  return (
    <div className="space-y-6">
      <TabsNav />
      {tab === 'profile' && <ProfileSection />}
      {tab === 'courses' && <CoursesSection enrollments={enrollments} />}
      {tab === 'payments' && <PaymentsSection payments={payments} />}
      {tab === 'progress' && <ProgressSection rows={progress} />}
      {tab === 'submissions' && <SubmissionsSection rows={submissions} />}
      {tab === 'settings' && <SettingsSection user={user} />}
    </div>
  )
}