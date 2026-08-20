'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ScheduleEventType } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireTeacher } from './requireTeacher'
import { requireOwnedGroup, requireOwnedEvent } from './ownership'
import type { ActionResult } from './types'

const eventSchema = z.object({
  type: z.nativeEnum(ScheduleEventType),
  title: z.string().trim().max(120).nullable(),
  notes: z.string().trim().max(2000).nullable(),
  startsAt: z.string().min(1, 'Укажите дату и время'),
  durationMin: z.number().int().min(5, 'Минимум 5 минут').max(600, 'Слишком долго')
})

function readEvent(form: FormData) {
  const title = String(form.get('title') ?? '').trim()
  const notes = String(form.get('notes') ?? '').trim()

  return {
    type: String(form.get('type') ?? 'LESSON'),
    title: title || null,
    notes: notes || null,
    startsAt: String(form.get('startsAt') ?? ''),
    durationMin: Number(form.get('durationMin') ?? 60)
  }
}

export async function createScheduleEvent(
  groupId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const group = await requireOwnedGroup(groupId, teacher.id)
  if (!group) return { ok: false, error: 'Группа не найдена' }

  const parsed = eventSchema.safeParse(readEvent(form))
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const startsAt = new Date(parsed.data.startsAt)
  if (Number.isNaN(startsAt.getTime())) return { ok: false, error: 'Некорректная дата' }

  await prisma.scheduleEvent.create({
    data: {
      groupId,
      type: parsed.data.type,
      title: parsed.data.title,
      notes: parsed.data.notes,
      startsAt,
      durationMin: parsed.data.durationMin
    }
  })

  revalidatePath(`/ru/teacher/groups/${groupId}`)
  return { ok: true }
}

export async function updateScheduleEvent(
  eventId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const event = await requireOwnedEvent(eventId, teacher.id)
  if (!event) return { ok: false, error: 'Занятие не найдено' }

  const parsed = eventSchema.safeParse(readEvent(form))
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const startsAt = new Date(parsed.data.startsAt)
  if (Number.isNaN(startsAt.getTime())) return { ok: false, error: 'Некорректная дата' }

  await prisma.scheduleEvent.update({
    where: { id: eventId },
    data: {
      type: parsed.data.type,
      title: parsed.data.title,
      notes: parsed.data.notes,
      startsAt,
      durationMin: parsed.data.durationMin
    }
  })

  revalidatePath(`/ru/teacher/groups/${event.groupId}`)
  revalidatePath(`/ru/teacher/groups/${event.groupId}/schedule/${eventId}`)
  return { ok: true }
}

export async function deleteScheduleEvent(eventId: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const event = await requireOwnedEvent(eventId, teacher.id)
  if (!event) return { ok: false, error: 'Занятие не найдено' }

  await prisma.scheduleEvent.delete({ where: { id: eventId } })
  revalidatePath(`/ru/teacher/groups/${event.groupId}`)
  return { ok: true }
}
