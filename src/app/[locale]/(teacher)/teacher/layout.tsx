import { requireTeacher } from '@/features/teacher/requireTeacher'
import { getPendingExamCount } from '@/features/teacher/examReview'
import { StaffShell, type StaffItem } from '@/design/layout/StaffShell'

export const metadata = {
  title: 'Кабинет преподавателя — Highgate',
  robots: { index: false, follow: false }
}

export default async function TeacherLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const teacher = await requireTeacher(locale)
  const base = `/${locale}/teacher`

  const pendingExams = await getPendingExamCount(teacher.id)

  const items: StaffItem[] = [
    { href: `${base}/groups`, label: 'Группы', icon: 'groups' },
    { href: `${base}/exams`, label: 'Проверка', icon: 'review', badge: pendingExams },
    { href: base, label: 'Расписание', icon: 'schedule', exact: true },
    { href: `/${locale}/learn/account`, label: 'Профиль', icon: 'profile' }
  ]

  return (
    <StaffShell tone="teacher" items={items} siteHref={`/${locale}`}>
      {children}
    </StaffShell>
  )
}
