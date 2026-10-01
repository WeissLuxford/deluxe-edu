import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

export type Mark = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'NONE'

const COLUMNS = 8
const TASHKENT_MS = 5 * 60 * 60 * 1000
const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']

export const displayName = (u: { firstName: string | null; lastName: string | null; name: string | null }) =>
  [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || 'Без имени'

/** "Пн, Ср, Пт · 19:00" from the group's recent and planned events. */
function rhythmOf(dates: Date[]): string {
  if (dates.length === 0) return ''
  const local = dates.map(d => new Date(+d + TASHKENT_MS))
  const days = [...new Set(local.map(d => d.getUTCDay()))].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  const times = new Map<string, number>()
  for (const d of local) {
    const t = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
    times.set(t, (times.get(t) ?? 0) + 1)
  }
  const time = [...times.entries()].sort((a, b) => b[1] - a[1])[0][0]
  return `${days.map(d => WEEKDAYS[d]).join(', ')} · ${time}`
}

// Everything the group journal shows: who came to the last eight classes,
// whose work waits for review, and how far this month's parent reports are.
export async function loadJournal(groupId: string) {
  const now = new Date()

  const memberships = await prisma.groupMembership.findMany({
    where: { groupId, leftAt: null },
    orderBy: { joinedAt: 'asc' },
    select: { user: { select: { id: true, firstName: true, lastName: true, name: true } } }
  })
  const memberIds = memberships.map(m => m.user.id)

  const [pastDesc, upcoming, pendingCount, pending, latestReport] = await Promise.all([
    prisma.scheduleEvent.findMany({
      where: { groupId, startsAt: { lt: now } },
      orderBy: { startsAt: 'desc' },
      take: COLUMNS,
      select: { id: true, startsAt: true, durationMin: true }
    }),
    prisma.scheduleEvent.findMany({
      where: { groupId, startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 6,
      select: { id: true, startsAt: true }
    }),
    memberIds.length ? prisma.examAttempt.count({ where: { userId: { in: memberIds }, reviewStatus: 'PENDING' } }) : 0,
    memberIds.length
      ? prisma.examAttempt.findMany({
          where: { userId: { in: memberIds }, reviewStatus: 'PENDING' },
          orderBy: { submittedAt: 'asc' },
          take: 3,
          select: {
            id: true,
            submittedAt: true,
            exam: { select: { title: true, module: { select: { title: true } } } },
            user: { select: { firstName: true, lastName: true, name: true } }
          }
        })
      : [],
    prisma.monthlyReport.findFirst({ where: { groupId }, orderBy: { periodStart: 'desc' }, select: { periodStart: true } })
  ])

  const past = [...pastDesc].reverse()
  const attendance = past.length && memberIds.length
    ? await prisma.attendance.findMany({
        where: { eventId: { in: past.map(e => e.id) }, userId: { in: memberIds } },
        select: { eventId: true, userId: true, status: true }
      })
    : []
  const markOf = new Map(attendance.map(a => [`${a.userId}:${a.eventId}`, a.status as Mark]))

  const students = memberships.map(({ user }) => {
    const marks = past.map(e => ({ eventId: e.id, mark: markOf.get(`${user.id}:${e.id}`) ?? ('NONE' as Mark) }))
    const counted = marks.filter(m => m.mark !== 'NONE' && m.mark !== 'EXCUSED')
    const came = counted.filter(m => m.mark !== 'ABSENT').length
    const absences = marks.filter(m => m.mark === 'ABSENT').length
    return {
      id: user.id,
      name: displayName(user),
      marks,
      came,
      counted: counted.length,
      // Two or more misses in the last eight classes — the row turns pink.
      atRisk: absences >= 2
    }
  })

  let reports: { month: string; total: number; published: number; withoutComment: number } | null = null
  if (latestReport) {
    const rows = await prisma.monthlyReport.findMany({
      where: { groupId, periodStart: latestReport.periodStart },
      select: { status: true, comment: true }
    })
    reports = {
      month: MONTHS[latestReport.periodStart.getUTCMonth()],
      total: rows.length,
      published: rows.filter(r => r.status === 'PUBLISHED').length,
      withoutComment: rows.filter(r => r.status === 'DRAFT' && !r.comment?.trim()).length
    }
  }

  // "Start the class" opens the class happening now, or else the next one.
  const live = past.find(e => +e.startsAt + e.durationMin * 60_000 > +now)

  return {
    rhythm: rhythmOf([...past.map(e => e.startsAt), ...upcoming.map(e => e.startsAt)]),
    dates: past.map(e => ({ id: e.id, startsAt: e.startsAt })),
    students,
    pendingCount,
    pending: pending.map(p => ({
      id: p.id,
      who: displayName(p.user),
      what: `Контрольная · ${localized(p.exam.module.title, 'ru') || localized(p.exam.title, 'ru') || 'модуль'}`,
      submittedAt: p.submittedAt
    })),
    reports,
    currentEventId: live?.id ?? upcoming[0]?.id ?? null
  }
}

export type Journal = Awaited<ReturnType<typeof loadJournal>>
