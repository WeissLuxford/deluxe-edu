import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { createScheduleEvent } from '@/features/teacher/scheduleActions'
import { ScheduleEventForm } from '@/features/teacher/components/ScheduleEventForm'

export default async function NewScheduleEvent({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const teacher = await requireTeacher(locale)

  const group = await prisma.group.findFirst({
    where: { id, teacherId: teacher.id },
    select: { id: true, name: true }
  })
  if (!group) notFound()

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/teacher/groups/${id}`} className="admin-page-head__back">
        ← К группе «{group.name}»
      </Link>

      <h1 className="admin-page-head__title">
        Новое занятие
      </h1>

      <ScheduleEventForm
        action={createScheduleEvent.bind(null, id)}
        submitLabel="Создать"
        redirectTo={`/${locale}/teacher/groups/${id}`}
      />
    </div>
  )
}
