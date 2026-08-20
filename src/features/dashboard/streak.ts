import { prisma } from '@/lib/db'

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export async function getActivityDates(userId: string): Promise<Date[]> {
  const [progress, submissions] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId }, select: { updatedAt: true } }),
    prisma.submission.findMany({ where: { userId }, select: { createdAt: true } })
  ])

  return [...progress.map(p => p.updatedAt), ...submissions.map(s => s.createdAt)]
}

export function computeStreak(dates: Date[], now: Date = new Date()): number {
  const days = new Set(dates.map(dayKey))

  const cursor = new Date(now)
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayKey(cursor))) return 0
  }

  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export async function getCurrentStreak(userId: string): Promise<number> {
  const dates = await getActivityDates(userId)
  return computeStreak(dates)
}
