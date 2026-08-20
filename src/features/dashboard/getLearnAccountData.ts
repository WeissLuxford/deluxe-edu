import { prisma } from '@/lib/db'
import { getEnrolledCourses } from '@/features/learn/progress'
import { getCurrentStreak } from './streak'
import { evaluateAchievements, type AchievementContext } from './achievements'

export async function getLearnAccountData(userId: string, locale: string) {
  const [user, payments, submissions, courseTrees, devices, streakDays] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatarSkinId: true,
        role: true,
        locale: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true
      }
    }),
    prisma.payment.findMany({ where: { userId }, include: { course: true }, orderBy: { createdAt: 'desc' } }),
    prisma.submission.findMany({
      where: { userId },
      include: { assignment: { include: { lesson: { include: { course: true } } } } },
      orderBy: { createdAt: 'desc' }
    }),
    getEnrolledCourses(userId, locale),
    prisma.userDevice.findMany({ where: { userId, revokedAt: null }, orderBy: { lastSeenAt: 'desc' } }),
    getCurrentStreak(userId)
  ])

  if (!user) return null

  const lessonsPassedCount = courseTrees.reduce((n, t) => n + t.done, 0)
  const paymentsCount = payments.length

  const ctx: AchievementContext = {
    anyLessonWatched: courseTrees.some(t => t.modules.some(m => m.lessons.some(l => l.watched))),
    anyLessonPassed: lessonsPassedCount > 0,
    lessonsPassedCount,
    anyCourseCompleted: courseTrees.some(t => t.completed),
    allEnrolledCompleted: courseTrees.length > 0 && courseTrees.every(t => t.completed),
    paymentsCount,
    streakDays
  }

  await evaluateAchievements(userId, ctx)

  const earned = await prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { earnedAt: 'asc' }
  })

  return {
    user,
    payments,
    submissions,
    courseTrees,
    devices,
    lessonsPassedCount,
    streakDays,
    earned
  }
}

export type LearnAccountData = NonNullable<Awaited<ReturnType<typeof getLearnAccountData>>>
