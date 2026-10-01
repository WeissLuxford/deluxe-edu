import { prisma } from '@/lib/db'
import achievementsCatalog from '@/content/achievements.json'
import { levelCode, type LevelCode } from '@/design/levels'
import { computeStreak, getActivityDates } from '@/features/dashboard/streak'
import { getEnrolledCourses, resumeFromTree, type CourseTree, type ResumeTarget } from './progress'
import { getStudentGroups, getUpcomingEvents, type StudentUpcomingEvent } from './schedule'

export type TodayData = {
  firstName: string
  trees: CourseTree[]
  resume: ResumeTarget | null
  resumeLevel: LevelCode | null
  resumeLessonIndex: number | null
  resumeMinutes: number | null
  plan: string | null
  events: StudentUpcomingEvent[]
  streak: number
  week: { count: number; isToday: boolean }[]
  review: { teacher: string; grade: number; note: string; examTitle: unknown } | null
  achievements: { id: string; title: string }[]
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Monday-first week around today, with how many learning actions happened each day. */
function weekActivity(dates: Date[], now = new Date()) {
  const counts = new Map<string, number>()
  for (const d of dates) counts.set(dayKey(d), (counts.get(dayKey(d)) ?? 0) + 1)
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return { count: counts.get(dayKey(day)) ?? 0, isToday: dayKey(day) === dayKey(now) }
  })
}

export async function todayData(userId: string, locale: string): Promise<TodayData> {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const [user, trees, groups, dates, reviewed, earned] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, name: true } }),
    getEnrolledCourses(userId, locale),
    getStudentGroups(userId),
    getActivityDates(userId),
    prisma.examAttempt.findFirst({
      where: { userId, reviewStatus: { not: 'PENDING' }, reviewNote: { not: null }, reviewedAt: { gte: twoWeeksAgo } },
      orderBy: { reviewedAt: 'desc' },
      select: { grade: true, reviewNote: true, exam: { select: { title: true } }, reviewedBy: { select: { firstName: true, name: true } } }
    }),
    prisma.userAchievement.findMany({ where: { userId }, orderBy: { earnedAt: 'asc' }, select: { achievementId: true } })
  ])

  const active = trees.filter(tree => !tree.completed && tree.total > 0)
  const resumeTree = active[0] ?? null
  const resume = resumeTree ? resumeFromTree(resumeTree) : null
  const resumeLesson =
    resume?.kind === 'lesson' && resumeTree ? resumeTree.modules.flatMap(m => m.lessons).find(l => l.slug === resume.lessonSlug) ?? null : null

  const events = groups.length ? await getUpcomingEvents(groups.map(g => g.groupId), 3) : []
  const catalog = achievementsCatalog as Record<string, { title?: Record<string, string> }>

  return {
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    trees,
    resume,
    resumeLevel: resumeTree ? levelCode(resumeTree.level) : null,
    resumeLessonIndex: resumeLesson?.index ?? null,
    resumeMinutes: resumeLesson?.durationMin ?? null,
    plan: resumeTree?.plan ?? trees[0]?.plan ?? null,
    events,
    streak: computeStreak(dates),
    week: weekActivity(dates),
    review: reviewed?.reviewNote
      ? {
          teacher: reviewed.reviewedBy?.firstName || reviewed.reviewedBy?.name || '',
          grade: reviewed.grade,
          note: reviewed.reviewNote,
          examTitle: reviewed.exam.title
        }
      : null,
    achievements: earned.map(a => ({ id: a.achievementId, title: catalog[a.achievementId]?.title?.[locale] ?? catalog[a.achievementId]?.title?.ru ?? a.achievementId }))
  }
}
