'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireTeacher } from './requireTeacher'
import { requireOwnedGroup } from './ownership'
import type { ActionResult } from './types'

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Введите название группы')
  .max(60, 'Слишком длинное название')

export async function createGroup(_prev: unknown, form: FormData): Promise<ActionResult> {
  const teacher = await requireTeacher()

  const parsed = nameSchema.safeParse(String(form.get('name') ?? ''))
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  await prisma.group.create({ data: { name: parsed.data, teacherId: teacher.id } })
  revalidatePath('/ru/teacher/groups')
  return { ok: true }
}

export async function renameGroup(groupId: string, _prev: unknown, form: FormData): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const group = await requireOwnedGroup(groupId, teacher.id)
  if (!group) return { ok: false, error: 'Группа не найдена' }

  const parsed = nameSchema.safeParse(String(form.get('name') ?? ''))
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  await prisma.group.update({ where: { id: groupId }, data: { name: parsed.data } })
  revalidatePath('/ru/teacher/groups')
  revalidatePath(`/ru/teacher/groups/${groupId}`)
  return { ok: true }
}

export async function setGroupArchived(groupId: string, archived: boolean): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const group = await requireOwnedGroup(groupId, teacher.id)
  if (!group) return { ok: false, error: 'Группа не найдена' }

  await prisma.group.update({ where: { id: groupId }, data: { archived } })
  revalidatePath('/ru/teacher/groups')
  revalidatePath(`/ru/teacher/groups/${groupId}`)
  return { ok: true }
}

export async function deleteGroup(groupId: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const group = await requireOwnedGroup(groupId, teacher.id)
  if (!group) return { ok: false, error: 'Группа не найдена' }

  const events = await prisma.scheduleEvent.count({ where: { groupId } })
  if (events > 0) {
    return {
      ok: false,
      error: 'Нельзя удалить группу с занятиями в расписании — сначала заархивируйте её.'
    }
  }

  await prisma.group.delete({ where: { id: groupId } })
  revalidatePath('/ru/teacher/groups')
  return { ok: true }
}

export async function addMember(groupId: string, _prev: unknown, form: FormData): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const group = await requireOwnedGroup(groupId, teacher.id)
  if (!group) return { ok: false, error: 'Группа не найдена' }

  const userId = String(form.get('userId') ?? '')
  if (!userId) return { ok: false, error: 'Выберите студента' }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
  if (!user || user.role !== 'STUDENT') return { ok: false, error: 'Можно добавлять только студентов' }

  const existing = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId, userId } }
  })

  if (existing) {
    if (existing.leftAt === null) return { ok: false, error: 'Студент уже в группе' }
    await prisma.groupMembership.update({
      where: { id: existing.id },
      data: { leftAt: null, joinedAt: new Date() }
    })
  } else {
    await prisma.groupMembership.create({ data: { groupId, userId } })
  }

  revalidatePath(`/ru/teacher/groups/${groupId}`)
  return { ok: true }
}

export async function removeMember(groupId: string, userId: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const group = await requireOwnedGroup(groupId, teacher.id)
  if (!group) return { ok: false, error: 'Группа не найдена' }

  await prisma.groupMembership.updateMany({
    where: { groupId, userId, leftAt: null },
    data: { leftAt: new Date() }
  })

  revalidatePath(`/ru/teacher/groups/${groupId}`)
  return { ok: true }
}
