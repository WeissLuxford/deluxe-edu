import { prisma } from '@/lib/db'
import type { AttendanceStatus, ScheduleEventType } from '@prisma/client'
import { getCurrentStreak } from '@/features/dashboard/streak'

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

export type LeaderboardEntry = {
  userId: string
  name: string
  lessonsPassed: number
  streak: number
  isCurrentUser: boolean
}

// Рейтинг внутри своей группы, а не среди чужих людей — это реальная мотивация,
// а не абстрактное соревнование с анонимами.
export async function getGroupLeaderboard(groupIds: string[], currentUserId: string): Promise<LeaderboardEntry[]> {
  if (groupIds.length === 0) return []

  const memberships = await prisma.groupMembership.findMany({
    where: { groupId: { in: groupIds }, leftAt: null },
    select: { userId: true, user: { select: { name: true, firstName: true } } }
  })
  if (memberships.length === 0) return []

  const nameByUser = new Map(memberships.map(m => [m.userId, m.user.firstName || m.user.name || 'Без имени']))
  const userIds = Array.from(nameByUser.keys())

  const [passedCounts, streaks] = await Promise.all([
    prisma.lessonProgress.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, passed: true },
      _count: { _all: true }
    }),
    Promise.all(userIds.map(async id => ({ id, streak: await getCurrentStreak(id) })))
  ])

  const passedByUser = new Map(passedCounts.map(p => [p.userId, p._count._all]))
  const streakByUser = new Map(streaks.map(s => [s.id, s.streak]))

  const entries: LeaderboardEntry[] = userIds.map(id => ({
    userId: id,
    name: nameByUser.get(id) ?? 'Без имени',
    lessonsPassed: passedByUser.get(id) ?? 0,
    streak: streakByUser.get(id) ?? 0,
    isCurrentUser: id === currentUserId
  }))

  entries.sort((a, b) => b.lessonsPassed - a.lessonsPassed || b.streak - a.streak)
  return entries
}
