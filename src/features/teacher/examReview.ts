import { prisma } from '@/lib/db'

async function ownedStudentIds(teacherId: string): Promise<string[]> {
  const memberships = await prisma.groupMembership.findMany({
    where: { leftAt: null, group: { teacherId } },
    select: { userId: true }
  })
  return memberships.map(m => m.userId)
}

export async function getPendingExamAttempts(teacherId: string) {
  const studentIds = await ownedStudentIds(teacherId)
  if (studentIds.length === 0) return []

  return prisma.examAttempt.findMany({
    where: { userId: { in: studentIds }, reviewStatus: 'PENDING' },
    include: {
      exam: { include: { module: { include: { course: { select: { id: true, title: true } } } } } },
      user: { select: { id: true, name: true, phone: true, email: true } }
    },
    orderBy: { submittedAt: 'asc' }
  })
}

export async function getPendingExamCount(teacherId: string): Promise<number> {
  const studentIds = await ownedStudentIds(teacherId)
  if (studentIds.length === 0) return 0

  return prisma.examAttempt.count({
    where: { userId: { in: studentIds }, reviewStatus: 'PENDING' }
  })
}
