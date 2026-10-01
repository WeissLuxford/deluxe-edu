import { prisma } from '@/lib/db'

/** What the app shell needs: where "My courses" leads and the small nav badges. */
export async function shellProps(userId: string, locale: string) {
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const [latest, groupIds] = await Promise.all([
    prisma.enrollment.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: [{ lastVisitedAt: 'desc' }, { createdAt: 'desc' }],
      select: { course: { select: { slug: true } } }
    }),
    prisma.groupMembership.findMany({ where: { userId, leftAt: null }, select: { groupId: true } })
  ])

  const liveSoon = groupIds.length
    ? await prisma.scheduleEvent.count({
        where: { groupId: { in: groupIds.map(g => g.groupId) }, startsAt: { gte: now, lt: in24h } }
      })
    : 0

  return {
    coursesHref: latest ? `/${locale}/learn/${latest.course.slug}` : `/${locale}/courses`,
    badges: { live: liveSoon || undefined }
  }
}
