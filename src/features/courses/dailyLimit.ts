import { prisma } from '@/lib/db'
import { dayBounds } from '@/lib/day'

export const FREE_DAILY_LESSON_LIMIT = 2

export async function getFreeDailyLessonCount(userId: string, now: Date = new Date()): Promise<number> {
  const { start, end } = dayBounds(now)

  return prisma.lessonProgress.count({
    where: {
      userId,
      passedAt: { gte: start, lt: end },
      lesson: { course: { Enrollment: { some: { userId, plan: 'FREE' } } } }
    }
  })
}

export type DailyLimitCheck = {
  limited: boolean
  allowed: boolean
  remaining: number
  resetAt: Date
}

// Лимит останавливает только СТАРТ нового урока: если строка прогресса уже
// есть (урок начат), доучить его можно даже сверх дневного лимита.
export async function assertWithinDailyLimit(
  userId: string,
  lessonId: string,
  now: Date = new Date()
): Promise<DailyLimitCheck> {
  const { end } = dayBounds(now)
  const notLimited: DailyLimitCheck = { limited: false, allowed: true, remaining: FREE_DAILY_LESSON_LIMIT, resetAt: end }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { courseId: true }
  })
  if (!lesson) return notLimited

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId: lesson.courseId, status: 'ACTIVE' },
    select: { plan: true }
  })
  if (!enrollment || enrollment.plan !== 'FREE') return notLimited

  const alreadyStarted = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { id: true }
  })
  if (alreadyStarted) return { limited: true, allowed: true, remaining: FREE_DAILY_LESSON_LIMIT, resetAt: end }

  const count = await getFreeDailyLessonCount(userId, now)
  const remaining = Math.max(0, FREE_DAILY_LESSON_LIMIT - count)

  return { limited: true, allowed: remaining > 0, remaining, resetAt: end }
}
