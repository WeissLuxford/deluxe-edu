import { prisma } from '@/lib/db'

export type AchievementId =
  | 'first_lesson_watched'
  | 'first_lesson_passed'
  | 'five_lessons_passed'
  | 'first_course_completed'
  | 'all_courses_completed'
  | 'first_payment'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'

export const ACHIEVEMENT_IDS: AchievementId[] = [
  'first_lesson_watched',
  'first_lesson_passed',
  'five_lessons_passed',
  'first_course_completed',
  'all_courses_completed',
  'first_payment',
  'streak_3',
  'streak_7',
  'streak_30'
]

export type AchievementContext = {
  anyLessonWatched: boolean
  anyLessonPassed: boolean
  lessonsPassedCount: number
  anyCourseCompleted: boolean
  allEnrolledCompleted: boolean
  paymentsCount: number
  streakDays: number
}

export const ACHIEVEMENT_CHECKS: Record<AchievementId, (ctx: AchievementContext) => boolean> = {
  first_lesson_watched: ctx => ctx.anyLessonWatched,
  first_lesson_passed: ctx => ctx.anyLessonPassed,
  five_lessons_passed: ctx => ctx.lessonsPassedCount >= 5,
  first_course_completed: ctx => ctx.anyCourseCompleted,
  all_courses_completed: ctx => ctx.allEnrolledCompleted,
  first_payment: ctx => ctx.paymentsCount >= 1,
  streak_3: ctx => ctx.streakDays >= 3,
  streak_7: ctx => ctx.streakDays >= 7,
  streak_30: ctx => ctx.streakDays >= 30
}

export async function evaluateAchievements(userId: string, ctx: AchievementContext): Promise<void> {
  const unlocked = ACHIEVEMENT_IDS.filter(id => ACHIEVEMENT_CHECKS[id](ctx))
  if (!unlocked.length) return

  await prisma.userAchievement.createMany({
    data: unlocked.map(achievementId => ({ userId, achievementId })),
    skipDuplicates: true
  })
}
