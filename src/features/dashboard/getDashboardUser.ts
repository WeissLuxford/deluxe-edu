import { prisma } from '@/lib/db'

export async function getDashboardUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      Payment: { include: { course: true }, orderBy: { createdAt: 'desc' } },
      LessonProgress: {
        include: { lesson: { include: { course: { select: { slug: true, title: true } } } } },
        orderBy: { updatedAt: 'desc' }
      },
      submissions: true,
      _count: { select: { enrollments: true } }
    }
  })
}
