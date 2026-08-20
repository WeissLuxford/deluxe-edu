'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { AttendanceStatus } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireTeacher } from './requireTeacher'
import { requireOwnedEvent } from './ownership'
import type { ActionResult } from './types'

const recordSchema = z.object({
  userId: z.string().min(1),
  status: z.nativeEnum(AttendanceStatus)
})

export async function saveAttendance(
  eventId: string,
  records: { userId: string; status: AttendanceStatus }[]
): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const event = await requireOwnedEvent(eventId, teacher.id)
  if (!event) return { ok: false, error: 'Занятие не найдено' }

  const parsed = z.array(recordSchema).safeParse(records)
  if (!parsed.success) return { ok: false, error: 'Некорректные данные' }

  const activeMembers = await prisma.groupMembership.findMany({
    where: { groupId: event.groupId, leftAt: null },
    select: { userId: true }
  })
  const memberIds = new Set(activeMembers.map(m => m.userId))

  const valid = parsed.data.filter(r => memberIds.has(r.userId))
  if (valid.length === 0) return { ok: true }

  await prisma.$transaction(
    valid.map(r =>
      prisma.attendance.upsert({
        where: { eventId_userId: { eventId, userId: r.userId } },
        update: { status: r.status },
        create: { eventId, userId: r.userId, status: r.status }
      })
    )
  )

  revalidatePath(`/ru/teacher/groups/${event.groupId}/schedule/${eventId}`)
  return { ok: true }
}

export async function markAllPresent(eventId: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const event = await requireOwnedEvent(eventId, teacher.id)
  if (!event) return { ok: false, error: 'Занятие не найдено' }

  const members = await prisma.groupMembership.findMany({
    where: { groupId: event.groupId, leftAt: null },
    select: { userId: true }
  })

  if (members.length === 0) return { ok: true }

  await prisma.$transaction(
    members.map(m =>
      prisma.attendance.upsert({
        where: { eventId_userId: { eventId, userId: m.userId } },
        update: { status: 'PRESENT' },
        create: { eventId, userId: m.userId, status: 'PRESENT' }
      })
    )
  )

  revalidatePath(`/ru/teacher/groups/${event.groupId}/schedule/${eventId}`)
  return { ok: true }
}
