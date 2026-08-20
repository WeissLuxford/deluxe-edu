import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { updateScheduleEvent, deleteScheduleEvent } from '@/features/teacher/scheduleActions'
import { ScheduleEventForm } from '@/features/teacher/components/ScheduleEventForm'
import { AttendanceGrid } from '@/features/teacher/components/AttendanceGrid'
import { DeleteButton } from '@/features/teacher/components/DeleteButton'

const TYPE_LABELS: Record<string, string> = {
  LESSON: 'Урок',
  MOCK_TEST: 'Мок-тест',
  EXAM: 'Контрольная',
  SPEAKING_PRACTICE: 'Спикинг',
  OTHER: 'Другое'
}

function contact(user: { phone: string | null; email: string | null }) {
  if (user.phone) return `+${user.phone}`
  return user.email || 'без контакта'
}

export default async function ScheduleEventDetail({
  params
}: {
  params: Promise<{ locale: string; id: string; eventId: string }>
}) {
  const { locale, id, eventId } = await params
  const teacher = await requireTeacher(locale)

  const event = await prisma.scheduleEvent.findFirst({
    where: { id: eventId, group: { id, teacherId: teacher.id } },
    include: { group: { select: { id: true, name: true } } }
  })
  if (!event) notFound()

  const [memberships, attendance] = await Promise.all([
    prisma.groupMembership.findMany({
      where: { groupId: id, leftAt: null },
      orderBy: { joinedAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, firstName: true, lastName: true, phone: true, email: true } }
      }
    }),
    prisma.attendance.findMany({ where: { eventId } })
  ])

  const statusByUser = new Map(attendance.map(a => [a.userId, a.status]))

  const members = memberships.map(m => ({
    userId: m.user.id,
    name: [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.name || 'без имени',
    contact: contact(m.user),
    status: statusByUser.get(m.user.id) ?? null
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/teacher/groups/${id}`} className="text-sm" style={{ color: 'var(--muted)' }}>
          ← К группе «{event.group.name}»
        </Link>
        <DeleteButton
          action={deleteScheduleEvent.bind(null, eventId)}
          confirmText="Удалить это занятие? Отметки посещаемости по нему тоже удалятся."
        />
      </div>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
        {event.title || TYPE_LABELS[event.type]} · {TYPE_LABELS[event.type]}
      </h2>

      <ScheduleEventForm
        action={updateScheduleEvent.bind(null, eventId)}
        submitLabel="Сохранить"
        redirectTo={`/${locale}/teacher/groups/${id}`}
        defaultValues={{
          type: event.type,
          title: event.title,
          notes: event.notes,
          startsAt: event.startsAt,
          durationMin: event.durationMin
        }}
      />

      <AttendanceGrid eventId={eventId} members={members} />
    </div>
  )
}
