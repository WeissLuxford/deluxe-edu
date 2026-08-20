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
