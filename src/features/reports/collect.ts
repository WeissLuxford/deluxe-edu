import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

// Сборка месячного отчёта родителю.
//
// Результат замораживается в MonthlyReport.data и больше не пересчитывается:
// мартовский отчёт не должен меняться, когда придёт апрельская посещаемость, а
// комментарий преподаватель пишет к тем числам, которые видел. Поэтому здесь
// нет ни одного «живого» поля — всё, что попадёт на страницу родителя, лежит в
// снимке.

export const REPORT_VERSION = 1 as const

export type ReportExam = {
  title: string
  submittedAt: string
  grade: number
  correct: number
  total: number
  /** PENDING показывается как «на проверке», а не как оценка. */
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  note: string | null
}

export type ReportSnapshot = {
  version: typeof REPORT_VERSION
  generatedAt: string
  student: { name: string }
  group: { name: string; teacherName: string }
  period: { start: string; end: string; label: string }
  /** Ученик мог прийти или уйти посреди месяца — на странице это оговаривается. */
  membership: { joinedAt: string; leftAt: string | null; partial: boolean }
  attendance: {
    events: number
    present: number
    late: number
    absent: number
    excused: number
    countable: number
    ratePercent: number | null
  }
  homework: { submitted: number; graded: number; averageGrade: number | null }
  lessons: { passed: number }
  rank: { position: number | null; of: number; lessonsPassed: number }
  exams: ReportExam[]
  speaking: { completed: number; recordings: number }
}

const MONTHS = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
]

/** Календарный месяц: [1 число 00:00, 1 число следующего месяца 00:00). */
export function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 1))
  return { start, end, label: `${MONTHS[month]} ${year}` }
}

export function periodLabel(start: Date) {
  return `${MONTHS[start.getUTCMonth()]} ${start.getUTCFullYear()}`
}

function displayName(user: { firstName: string | null; lastName: string | null; name: string | null }) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || 'Без имени'
}

/**
 * Место в группе считается по урокам, пройденным за сам период, а не за всё
 * время: иначе новичок всегда последний, что бы он ни делал в этом месяце.
 */
async function rankInGroup(
  groupId: string,
  userId: string,
  start: Date,
  end: Date
): Promise<ReportSnapshot['rank']> {
  const members = await prisma.groupMembership.findMany({
    where: { groupId, leftAt: null },
    select: { userId: true }
  })
  const memberIds = members.map(m => m.userId)
  if (memberIds.length === 0) return { position: null, of: 0, lessonsPassed: 0 }

  const passed = await prisma.lessonProgress.groupBy({
    by: ['userId'],
    where: { userId: { in: memberIds }, passed: true, passedAt: { gte: start, lt: end } },
    _count: { _all: true }
  })

  const byUser = new Map(passed.map(p => [p.userId, p._count._all]))
  const scores = memberIds
    .map(id => ({ id, passed: byUser.get(id) ?? 0 }))
    .sort((a, b) => b.passed - a.passed)

  const mine = byUser.get(userId) ?? 0
  // Одинаковый результат — одинаковое место, без произвольного порядка.
  const position = scores.filter(s => s.passed > mine).length + 1

  return { position, of: memberIds.length, lessonsPassed: mine }
}

export async function collectMonthly(
  userId: string,
  groupId: string,
  start: Date,
  end: Date
): Promise<ReportSnapshot | null> {
  const membership = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId, userId } },
    include: {
      user: { select: { firstName: true, lastName: true, name: true } },
      group: { select: { name: true, teacher: { select: { firstName: true, lastName: true, name: true } } } }
    }
  })
  if (!membership) return null

  // Присоединился после конца периода или ушёл до его начала — отчёта нет.
  if (membership.joinedAt >= end) return null
  if (membership.leftAt && membership.leftAt < start) return null

  const [attendanceRows, submissions, lessonsPassed, examAttempts, dialogues, rank] = await Promise.all([
    prisma.attendance.findMany({
      where: { userId, event: { groupId, startsAt: { gte: start, lt: end } } },
      select: { status: true }
    }),
    prisma.submission.findMany({
      where: { userId, createdAt: { gte: start, lt: end } },
      select: { grade: true }
    }),
    prisma.lessonProgress.count({
      where: { userId, passed: true, passedAt: { gte: start, lt: end } }
    }),
    prisma.examAttempt.findMany({
      where: { userId, submittedAt: { gte: start, lt: end } },
      orderBy: { submittedAt: 'asc' },
      include: { exam: { select: { title: true } } }
    }),
    prisma.dialogueAttempt.findMany({
      where: { userId, status: 'COMPLETED', completedAt: { gte: start, lt: end } },
      select: { _count: { select: { recordings: true } } }
    }),
    rankInGroup(groupId, userId, start, end)
  ])

  const present = attendanceRows.filter(a => a.status === 'PRESENT').length
  const late = attendanceRows.filter(a => a.status === 'LATE').length
  const absent = attendanceRows.filter(a => a.status === 'ABSENT').length
  const excused = attendanceRows.filter(a => a.status === 'EXCUSED').length
  // Уважительный пропуск не портит процент — так же, как на странице группы.
  const countable = present + late + absent
  const graded = submissions.filter(s => s.grade != null)

  return {
    version: REPORT_VERSION,
    generatedAt: new Date().toISOString(),
    student: { name: displayName(membership.user) },
    group: {
      name: membership.group.name,
      teacherName: displayName(membership.group.teacher)
    },
    period: { start: start.toISOString(), end: end.toISOString(), label: periodLabel(start) },
    membership: {
      joinedAt: membership.joinedAt.toISOString(),
      leftAt: membership.leftAt?.toISOString() ?? null,
      partial: membership.joinedAt > start || (membership.leftAt != null && membership.leftAt < end)
    },
    attendance: {
      events: attendanceRows.length,
      present,
      late,
      absent,
      excused,
      countable,
      // Ни одного занятия в периоде — это «занятий не было», а не ноль процентов.
      ratePercent: countable > 0 ? Math.round(((present + late) / countable) * 100) : null
    },
    homework: {
      submitted: submissions.length,
      graded: graded.length,
      averageGrade: graded.length
        ? Math.round(graded.reduce((sum, s) => sum + (s.grade ?? 0), 0) / graded.length)
        : null
    },
    lessons: { passed: lessonsPassed },
    rank,
    exams: examAttempts.map(a => ({
      title: localized(a.exam.title, 'ru') || 'Контрольная',
      submittedAt: a.submittedAt.toISOString(),
      grade: a.grade,
      correct: a.correct,
      total: a.total,
      status: a.reviewStatus,
      note: a.reviewNote
    })),
    speaking: {
      completed: dialogues.length,
      recordings: dialogues.reduce((sum, d) => sum + d._count.recordings, 0)
    }
  }
}
