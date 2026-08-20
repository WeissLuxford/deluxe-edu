import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/features/admin/requireAdmin'
import { localized } from '@/lib/localized'

const ru = (value: unknown) => localized(value, 'ru') || '—'

const TYPE_LABELS: Record<string, string> = {
  LESSON: 'Урок',
  MOCK_TEST: 'Мок-тест',
  EXAM: 'Контрольная',
  SPEAKING_PRACTICE: 'Спикинг',
  OTHER: 'Другое'
}

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'был',
  ABSENT: 'не был',
  LATE: 'опоздал',
  EXCUSED: 'уваж.'
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

function contact(user: { phone: string | null; email: string | null }) {
  if (user.phone) return `+${user.phone}`
  return user.email || 'без контакта'
}

export default async function AdminTeacherGroupDetail({
  params
}: {
  params: Promise<{ locale: string; id: string; groupId: string }>
}) {
  const { locale, id, groupId } = await params
  await requireAdmin(locale)

  const group = await prisma.group.findFirst({
    where: { id: groupId, teacherId: id },
    include: { teacher: { select: { name: true } } }
  })
  if (!group) notFound()

  const memberships = await prisma.groupMembership.findMany({
    where: { groupId, leftAt: null },
    orderBy: { joinedAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, phone: true, email: true } }
    }
  })

  const memberIds = memberships.map(m => m.user.id)

  const [enrollments, events] = await Promise.all([
    memberIds.length
      ? prisma.enrollment.findMany({
          where: { userId: { in: memberIds }, status: 'ACTIVE' },
          select: { userId: true, course: { select: { title: true } } }
        })
      : Promise.resolve([]),
    prisma.scheduleEvent.findMany({
      where: { groupId },
      orderBy: { startsAt: 'desc' },
      take: 30,
      include: { attendance: { select: { status: true } } }
    })
  ])

  const coursesByUser = new Map<string, string[]>()
  for (const e of enrollments) {
    const list = coursesByUser.get(e.userId) ?? []
    list.push(ru(e.course.title))
    coursesByUser.set(e.userId, list)
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/admin/teachers/${id}`}
        className="text-sm"
        style={{ color: 'var(--muted)' }}
      >
        ← К группам «{group.teacher.name || 'учителя'}»
      </Link>

      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h1 className="admin-page-head__title">{group.name}</h1>
          <p className="admin-page-head__sub">
            {memberships.length} студентов{group.archived ? ' · в архиве' : ''} — только просмотр
          </p>
        </div>
      </header>

      <section className="admin-card">
        <h3 className="admin-card__title">Студенты</h3>
        {memberships.length === 0 ? (
          <p className="admin-empty">В группе пока нет студентов.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Студент</th>
                  <th>Курс</th>
                  <th>В группе с</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map(m => (
                  <tr key={m.id}>
                    <td>
                      <span style={{ color: 'var(--fg)' }}>
                        {[m.user.firstName, m.user.lastName].filter(Boolean).join(' ') ||
                          m.user.name ||
                          'без имени'}
                      </span>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {contact(m.user)}
                      </div>
                    </td>
                    <td>{(coursesByUser.get(m.user.id) ?? []).join(', ') || '—'}</td>
                    <td>{dateFmt.format(m.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <h3 className="admin-card__title">Расписание и посещаемость</h3>
        {events.length === 0 ? (
          <p className="admin-empty">Занятий пока не было.</p>
        ) : (
          <ul className="admin-feed">
            {events.map(e => {
              const tally = e.attendance.reduce<Record<string, number>>((acc, a) => {
                acc[a.status] = (acc[a.status] ?? 0) + 1
                return acc
              }, {})
              const summary = Object.entries(tally)
                .map(([status, count]) => `${count} ${STATUS_LABELS[status] ?? status}`)
                .join(', ')

              return (
                <li key={e.id}>
                  <span>
                    <strong>{e.title || TYPE_LABELS[e.type]}</strong>
                    <span>
                      {TYPE_LABELS[e.type]}
                      {summary ? ` · ${summary}` : ' · не отмечено'}
                    </span>
                  </span>
                  <time>{dateFmt.format(e.startsAt)}</time>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
