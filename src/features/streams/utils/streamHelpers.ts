import { prisma } from '@/lib/db'

export type StreamStatus = 'live' | 'upcoming' | 'past'

const PLAN_RANK: Record<string, number> = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
  DELUXE: 3
}

export function statusOf(startsAt: Date, durationMin: number, now = new Date()): StreamStatus {
  const start = startsAt.getTime()
  const end = start + durationMin * 60_000
  const t = now.getTime()

  if (t < start) return 'upcoming'
  if (t <= end) return 'live'
  return 'past'
}

export async function getPublishedStreams() {
  return prisma.stream.findMany({
    where: { published: true },
    orderBy: { startsAt: 'desc' }
  })
}

export async function getStreamById(id: string) {
  return prisma.stream.findFirst({ where: { id, published: true } })
}

export async function getUserPlanRank(userId: string | null): Promise<number | null> {
  if (!userId) return null

  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: 'ACTIVE' },
    select: { plan: true }
  })

  if (enrollments.length === 0) return null

  return enrollments.reduce((best, e) => {
    const rank = PLAN_RANK[e.plan || 'BASIC'] ?? 0
    return rank > best ? rank : best
  }, 0)
}

export function canWatch(requiredPlan: string | null, userPlanRank: number | null): boolean {
  if (!requiredPlan) return true
  if (userPlanRank === null) return false
  return userPlanRank >= (PLAN_RANK[requiredPlan] ?? 0)
}
