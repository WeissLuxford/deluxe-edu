import { prisma } from '@/lib/db'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { TeacherSidebar } from '@/features/teacher/components/TeacherSidebar'

export const metadata = {
  title: 'Кабинет учителя — Vertex',
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

  const groups = await prisma.group.count({ where: { teacherId: teacher.id, archived: false } })

  return (
    <div className="admin-shell">
      <TeacherSidebar
        locale={locale}
        teacherName={teacher.name || 'Учитель'}
        teacherPhone={teacher.phone || ''}
        counters={{ groups }}
      />

      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}
