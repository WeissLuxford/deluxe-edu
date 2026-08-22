import { prisma } from '@/lib/db'

export async function requireOwnedGroup(groupId: string, teacherId: string) {
  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group || group.teacherId !== teacherId) return null
  return group
}

export async function requireOwnedEvent(eventId: string, teacherId: string) {
  const event = await prisma.scheduleEvent.findUnique({
    where: { id: eventId },
    include: { group: true }
  })
  if (!event || event.group.teacherId !== teacherId) return null
  return event
}

// Учитель видит попытку студента, только если тот состоит в одной из его
// активных групп (Group.teacherId -> GroupMembership, без leftAt).
export async function requireOwnedStudentAttempt(attemptId: string, teacherId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { include: { module: { include: { course: true } } } },
      user: { select: { id: true, name: true, phone: true, email: true } }
    }
  })
  if (!attempt) return null

  const membership = await prisma.groupMembership.findFirst({
    where: { userId: attempt.userId, leftAt: null, group: { teacherId } },
    select: { id: true }
  })
  if (!membership) return null

  return attempt
}
