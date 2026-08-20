import { prisma } from '@/lib/db'
import type { AttendanceStatus, ScheduleEventType } from '@prisma/client'

export type StudentGroup = {
  groupId: string
  groupName: string
  teacherName: string
}

export type StudentUpcomingEvent = {
  id: string
  groupName: string
  type: ScheduleEventType
  title: string | null
  startsAt: Date
}

export type StudentAttendanceRecord = {
  id: string
  groupName: string
  type: ScheduleEventType
  title: string | null
  startsAt: Date
  status: AttendanceStatus
}

export async function getStudentGroups(userId: string): Promise<StudentGroup[]> {
  const memberships = await prisma.groupMembership.findMany({
    where: { userId, leftAt: null },
    include: { group: { include: { teacher: { select: { name: true } } } } }
  })

  return memberships.map(m => ({
    groupId: m.group.id,
    groupName: m.group.name,
    teacherName: m.group.teacher.name || ''
  }))
}

export async function getUpcomingEvents(groupIds: string[], take = 5): Promise<StudentUpcomingEvent[]> {
  if (groupIds.length === 0) return []

  const events = await prisma.scheduleEvent.findMany({
    where: { groupId: { in: groupIds }, startsAt: { gte: new Date() } },
    orderBy: { startsAt: 'asc' },
    take,
    include: { group: { select: { name: true } } }
  })

  return events.map(e => ({
    id: e.id,
    groupName: e.group.name,
    type: e.type,
    title: e.title,
    startsAt: e.startsAt
  }))
}

export async function getRecentAttendance(userId: string, take = 10): Promise<StudentAttendanceRecord[]> {
  const records = await prisma.attendance.findMany({
    where: { userId },
    orderBy: { event: { startsAt: 'desc' } },
    take,
    include: { event: { include: { group: { select: { name: true } } } } }
  })

  return records.map(a => ({
    id: a.id,
    groupName: a.event.group.name,
    type: a.event.type,
    title: a.event.title,
    startsAt: a.event.startsAt,
    status: a.status
  }))
}
