import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { setGroupArchived, deleteGroup, removeMember } from '@/features/teacher/groupActions'
import { GroupNameEditor } from '@/features/teacher/components/GroupNameEditor'
import { AddMemberForm } from '@/features/teacher/components/AddMemberForm'
import { ActionButton } from '@/features/teacher/components/ActionButton'
import { DeleteButton } from '@/features/teacher/components/DeleteButton'
import { localized } from '@/lib/localized'

const ru = (value: unknown) => localized(value, 'ru') || '—'

const TYPE_LABELS: Record<string, string> = {
  LESSON: 'Урок',
  MOCK_TEST: 'Мок-тест',
  EXAM: 'Контрольная',
  SPEAKING_PRACTICE: 'Спикинг',
  OTHER: 'Другое'
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

export default async function TeacherGroupDetail({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale, id } = await params
  const { q = '' } = await searchParams
  const query = q.trim()
  const teacher = await requireTeacher(locale)

  const group = await prisma.group.findFirst({ where: { id, teacherId: teacher.id } })
  if (!group) notFound()

  const memberships = await prisma.groupMembership.findMany({
    where: { groupId: id, leftAt: null },
    orderBy: { joinedAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, phone: true, email: true } }
    }
  })

  const memberIds = memberships.map(m => m.user.id)

  const [enrollments, events, availableStudents] = await Promise.all([
    memberIds.length
      ? prisma.enrollment.findMany({
          where: { userId: { in: memberIds }, status: 'ACTIVE' },
          select: { userId: true, course: { select: { title: true } } }
        })
      : Promise.resolve([]),
    prisma.scheduleEvent.findMany({
      where: { groupId: id },
      orderBy: { startsAt: 'desc' },
      take: 50
    }),
    prisma.user.findMany({
      where: {
        role: 'STUDENT',
        id: { notIn: memberIds.length ? memberIds : ['__none__'] },
        ...(query
          ? {
              OR: [
                { phone: { contains: query } },
                { name: { contains: query, mode: 'insensitive' as const } },
                { firstName: { contains: query, mode: 'insensitive' as const } },
                { lastName: { contains: query, mode: 'insensitive' as const } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, name: true, firstName: true, lastName: true, phone: true, email: true }
    })
  ])

  const coursesByUser = new Map<string, string[]>()
  for (const e of enrollments) {
    const list = coursesByUser.get(e.userId) ?? []
    list.push(ru(e.course.title))
    coursesByUser.set(e.userId, list)
  }

  const now = new Date()
  const upcoming = events.filter(e => e.startsAt >= now).sort((a, b) => +a.startsAt - +b.startsAt)
  const past = events.filter(e => e.startsAt < now)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/teacher/groups`} className="text-sm" style={{ color: 'var(--muted)' }}>
          ← К списку групп
        </Link>
        <div className="flex items-center gap-2">
          {group.archived ? (
            <ActionButton action={setGroupArchived.bind(null, id, false)} className="btn btn-ghost">
              Вернуть из архива
            </ActionButton>
          ) : (
            <ActionButton action={setGroupArchived.bind(null, id, true)} className="btn btn-ghost">
              Архивировать
            </ActionButton>
          )}
          <DeleteButton
            action={deleteGroup.bind(null, id)}
            confirmText={`Удалить группу «${group.name}»? Это необратимо.`}
          />
        </div>
      </div>

      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h1
            className="admin-page-head__title"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {group.name}
            <GroupNameEditor groupId={id} name={group.name} />
          </h1>
          <p className="admin-page-head__sub">
            {memberships.length} студентов{group.archived ? ' · в архиве' : ''}
          </p>
        </div>
      </header>

      <section className="admin-card">
        <h3 className="admin-card__title">Студенты</h3>

        <form method="get" className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <input
            name="q"
            defaultValue={query}
            className="input"
            placeholder="Найти студента для добавления"
            style={{ minWidth: '14rem' }}
          />
          <button type="submit" className="btn btn-secondary">
            Найти
          </button>
          {query && (
            <Link href={`/${locale}/teacher/groups/${id}`} className="btn btn-ghost">
              Сброс
            </Link>
          )}
        </form>

        <AddMemberForm
          groupId={id}
          students={availableStudents.map(s => ({
            id: s.id,
            label: `${s.firstName || s.name || 'без имени'} · ${contact(s)}`
          }))}
        />

        {memberships.length === 0 ? (
          <p className="admin-empty" style={{ marginTop: '1rem' }}>
            В группе пока нет студентов.
          </p>
        ) : (
          <div className="admin-table-wrap" style={{ marginTop: '1rem' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Студент</th>
                  <th>Курс</th>
                  <th>В группе с</th>
                  <th />
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
                    <td className="right">
                      <DeleteButton
                        action={removeMember.bind(null, id, m.user.id)}
                        confirmText={`Убрать «${m.user.name || 'студента'}» из группы?`}
                        label="Убрать"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
          <h3 className="admin-card__title" style={{ marginBottom: 0 }}>
            Расписание
          </h3>
          <Link href={`/${locale}/teacher/groups/${id}/schedule/new`} className="btn btn-primary btn-sm">
            Новое занятие
          </Link>
        </div>

        <h4 className="text-sm" style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>
          Ближайшие
        </h4>
        {upcoming.length === 0 ? (
          <p className="admin-empty">Ничего не запланировано.</p>
        ) : (
          <ul className="admin-feed">
            {upcoming.map(e => (
              <li key={e.id}>
                <Link href={`/${locale}/teacher/groups/${id}/schedule/${e.id}`}>
                  <strong>{e.title || TYPE_LABELS[e.type]}</strong>
                  <span>{TYPE_LABELS[e.type]}</span>
                </Link>
                <time>{dateFmt.format(e.startsAt)}</time>
              </li>
            ))}
          </ul>
        )}

        {past.length > 0 && (
          <>
            <h4 className="text-sm" style={{ color: 'var(--muted)', margin: '1rem 0 0.5rem' }}>
              Прошедшие
            </h4>
            <ul className="admin-feed">
              {past.slice(0, 10).map(e => (
                <li key={e.id}>
                  <Link href={`/${locale}/teacher/groups/${id}/schedule/${e.id}`}>
                    <strong>{e.title || TYPE_LABELS[e.type]}</strong>
                    <span>{TYPE_LABELS[e.type]}</span>
                  </Link>
                  <time>{dateFmt.format(e.startsAt)}</time>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
