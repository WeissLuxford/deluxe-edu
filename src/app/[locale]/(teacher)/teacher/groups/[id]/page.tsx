import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { setGroupArchived, deleteGroup, removeMember } from '@/features/teacher/groupActions'
import { loadJournal } from '@/features/teacher/journal'
import { GroupJournal } from '@/features/teacher/components/GroupJournal'
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

  const [enrollments, lessonProgress, attendanceRows, events, availableStudents, journal] = await Promise.all([
    memberIds.length
      ? prisma.enrollment.findMany({
          where: { userId: { in: memberIds }, status: 'ACTIVE' },
          select: {
            userId: true,
            lastVisitedAt: true,
            course: { select: { title: true, lessons: { select: { id: true } } } }
          }
        })
      : Promise.resolve([]),
    memberIds.length
      ? prisma.lessonProgress.findMany({
          where: { userId: { in: memberIds }, passed: true },
          select: { userId: true, lessonId: true }
        })
      : Promise.resolve([]),
    memberIds.length
      ? prisma.attendance.findMany({
          where: { userId: { in: memberIds }, event: { groupId: id } },
          select: { userId: true, status: true }
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
    }),
    loadJournal(id)
  ])

  const AT_RISK_PROGRESS = 30
  const AT_RISK_DAYS = 7
  const AT_RISK_ATTENDANCE = 50
  const MIN_ATTENDANCE_SAMPLES = 2

  const passedLessonIds = new Set(lessonProgress.map(p => p.lessonId))

  const enrollmentsByUser = new Map<string, typeof enrollments>()
  for (const e of enrollments) {
    const list = enrollmentsByUser.get(e.userId) ?? []
    list.push(e)
    enrollmentsByUser.set(e.userId, list)
  }

  const coursesByUser = new Map<string, string[]>()
  const progressByUser = new Map<string, number>()
  const lastVisitByUser = new Map<string, Date | null>()

  for (const [uid, list] of enrollmentsByUser) {
    coursesByUser.set(uid, list.map(e => ru(e.course.title)))

    const percents = list.map(e => {
      const total = e.course.lessons.length
      const done = e.course.lessons.filter(l => passedLessonIds.has(l.id)).length
      return total > 0 ? Math.round((done / total) * 100) : 0
    })
    progressByUser.set(uid, Math.min(...percents))

    const visits = list.map(e => e.lastVisitedAt).filter((d): d is Date => d != null)
    lastVisitByUser.set(uid, visits.length ? new Date(Math.max(...visits.map(d => +d))) : null)
  }

  const attendanceByUser = new Map<string, { present: number; countable: number }>()
  for (const a of attendanceRows) {
    const bucket = attendanceByUser.get(a.userId) ?? { present: 0, countable: 0 }
    if (a.status !== 'EXCUSED') {
      bucket.countable += 1
      if (a.status === 'PRESENT') bucket.present += 1
    }
    attendanceByUser.set(a.userId, bucket)
  }

  const relTime = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })
  function formatLastVisit(date: Date | null) {
    if (!date) return 'никогда'
    const days = Math.floor((Date.now() - +date) / 86_400_000)
    if (days <= 0) return 'сегодня'
    if (days < 30) return relTime.format(-days, 'day')
    return relTime.format(-Math.floor(days / 30), 'month')
  }

  function attendanceRate(uid: string) {
    const bucket = attendanceByUser.get(uid)
    if (!bucket || bucket.countable === 0) return null
    return Math.round((bucket.present / bucket.countable) * 100)
  }

  function isAtRisk(uid: string) {
    const progress = progressByUser.get(uid)
    const lastVisit = lastVisitByUser.get(uid) ?? null
    const daysSinceVisit = lastVisit ? (Date.now() - +lastVisit) / 86_400_000 : Infinity
    const rate = attendanceRate(uid)
    const bucket = attendanceByUser.get(uid)

    return (
      (progress !== undefined && progress < AT_RISK_PROGRESS) ||
      daysSinceVisit >= AT_RISK_DAYS ||
      (rate !== null && bucket!.countable >= MIN_ATTENDANCE_SAMPLES && rate < AT_RISK_ATTENDANCE)
    )
  }

  const riskByUser = new Map(memberIds.map(uid => [uid, isAtRisk(uid)]))
  const sortedMemberships = [...memberships].sort(
    (a, b) => Number(riskByUser.get(b.user.id)) - Number(riskByUser.get(a.user.id))
  )
  const atRiskCount = memberIds.filter(uid => riskByUser.get(uid)).length

  const now = new Date()
  const upcoming = events.filter(e => e.startsAt >= now).sort((a, b) => +a.startsAt - +b.startsAt)
  const past = events.filter(e => e.startsAt < now)

  const base = `/${locale}/teacher`
  const groupBase = `${base}/groups/${id}`

  return (
    <div className="space-y-6">
      <Link href={`${base}/groups`} className="admin-page-head__back">
        ← Все группы
      </Link>

      <GroupJournal
        name={group.name}
        journal={journal}
        meta={[atRiskCount > 0 ? `${atRiskCount} требуют внимания` : '', group.archived ? 'в архиве' : ''].filter(Boolean).join(' · ')}
        nameEditor={<GroupNameEditor groupId={id} name={group.name} />}
        links={{
          event: eventId => `${groupBase}/schedule/${eventId}`,
          review: attemptId => `${base}/exams/${attemptId}`,
          reviews: `${base}/exams`,
          reports: `${groupBase}/reports`
        }}
        actions={
          <>
            <Link href={`${groupBase}/reports`} className="btn btn-secondary">
              Отчёты родителям
            </Link>
            <Link
              href={journal.currentEventId ? `${groupBase}/schedule/${journal.currentEventId}` : `${groupBase}/schedule/new`}
              className="btn btn-primary"
            >
              {journal.currentEventId ? 'Начать занятие' : 'Запланировать занятие'}
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--c-lime)' }} aria-hidden="true" />
            </Link>
          </>
        }
      />

      <section className="admin-card">
        <h3 className="admin-card__title">Состав группы</h3>

        <form method="get" className="flex items-center gap-2" style={{ margin: '1rem 0' }}>
          <input name="q" defaultValue={query} className="input" placeholder="Найти ученика, чтобы добавить" style={{ maxWidth: '22rem' }} />
          <button type="submit" className="btn btn-secondary">
            Найти
          </button>
          {query && (
            <Link href={groupBase} className="btn btn-ghost">
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
            В группе пока нет учеников.
          </p>
        ) : (
          <div className="admin-table-wrap" style={{ marginTop: '1rem', padding: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Курс</th>
                  <th>Прогресс</th>
                  <th>Посещаемость</th>
                  <th>Последний визит</th>
                  <th>В группе с</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedMemberships.map(m => {
                  const risk = riskByUser.get(m.user.id) ?? false
                  const progress = progressByUser.get(m.user.id)
                  const rate = attendanceRate(m.user.id)
                  const lastVisit = lastVisitByUser.get(m.user.id) ?? null

                  return (
                    <tr key={m.id} className={risk ? 'row-risk' : undefined}>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {[m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.name || 'без имени'}
                        </span>
                        {risk && (
                          <span className="badge badge-error" style={{ marginLeft: '0.5rem' }}>
                            риск
                          </span>
                        )}
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>
                          {contact(m.user)}
                        </div>
                      </td>
                      <td>{(coursesByUser.get(m.user.id) ?? []).join(', ') || '—'}</td>
                      <td>
                        {progress === undefined ? (
                          '—'
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '6rem' }}>
                            <span style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--c-line-2)', overflow: 'hidden' }}>
                              <span
                                style={{
                                  display: 'block',
                                  height: 8,
                                  borderRadius: 4,
                                  width: `${progress}%`,
                                  background: progress < AT_RISK_PROGRESS ? 'var(--c-err)' : 'var(--c-violet)'
                                }}
                              />
                            </span>
                            <span className="text-xs">{progress}%</span>
                          </div>
                        )}
                      </td>
                      <td>{rate === null ? 'нет данных' : `${rate}%`}</td>
                      <td>{formatLastVisit(lastVisit)}</td>
                      <td>{dateFmt.format(m.joinedAt)}</td>
                      <td className="right">
                        <DeleteButton
                          action={removeMember.bind(null, id, m.user.id)}
                          confirmText={`Убрать «${m.user.name || 'ученика'}» из группы?`}
                          label="Убрать"
                        />
                      </td>
                    </tr>
                  )
                })}
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
          <Link href={`${groupBase}/schedule/new`} className="btn btn-primary btn-sm">
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
                <Link href={`${groupBase}/schedule/${e.id}`}>
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
                  <Link href={`${groupBase}/schedule/${e.id}`}>
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

      <section className="admin-card">
        <h3 className="admin-card__title">Группа</h3>
        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '0.75rem' }}>
          {group.archived ? (
            <ActionButton action={setGroupArchived.bind(null, id, false)} className="btn btn-secondary">
              Вернуть из архива
            </ActionButton>
          ) : (
            <ActionButton action={setGroupArchived.bind(null, id, true)} className="btn btn-secondary">
              Архивировать
            </ActionButton>
          )}
          <DeleteButton action={deleteGroup.bind(null, id)} confirmText={`Удалить группу «${group.name}»? Это необратимо.`} />
        </div>
      </section>
    </div>
  )
}
