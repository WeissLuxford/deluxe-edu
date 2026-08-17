'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import type { ActionResult } from './actions'

const localized = z.object({
  ru: z.string().trim().min(1, 'Русское название обязательно'),
  uz: z.string().trim().default(''),
  en: z.string().trim().default('')
})

const moduleSchema = z.object({
  title: localized,
  description: localized.partial().optional()
})

function readLocalized(form: FormData, prefix: string) {
  return {
    ru: String(form.get(`${prefix}_ru`) ?? ''),
    uz: String(form.get(`${prefix}_uz`) ?? ''),
    en: String(form.get(`${prefix}_en`) ?? '')
  }
}

function hasText(value: { ru: string; uz: string; en: string }) {
  return Boolean(value.ru.trim() || value.uz.trim() || value.en.trim())
}

export async function createModule(
  courseId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  await requireAdmin()

  const description = readLocalized(form, 'description')
  const parsed = moduleSchema.safeParse({ title: readLocalized(form, 'title') })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const last = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  await prisma.module.create({
    data: {
      courseId,
      title: parsed.data.title,
      description: hasText(description) ? description : undefined,
      order: (last?.order ?? -1) + 1
    }
  })

  revalidatePath(`/ru/admin/courses/${courseId}`)
  return { ok: true }
}

export async function updateModule(
  id: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  await requireAdmin()

  const description = readLocalized(form, 'description')
  const parsed = moduleSchema.safeParse({ title: readLocalized(form, 'title') })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const module = await prisma.module.findUnique({ where: { id }, select: { courseId: true } })
  if (!module) return { ok: false, error: 'Модуль не найден' }

  await prisma.module.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: hasText(description) ? description : Prisma.JsonNull
    }
  })

  revalidatePath(`/ru/admin/courses/${module.courseId}`)
  return { ok: true }
}

export async function deleteModule(id: string): Promise<ActionResult> {
  await requireAdmin()

  const module = await prisma.module.findUnique({
    where: { id },
    select: { courseId: true, _count: { select: { lessons: true } } }
  })
  if (!module) return { ok: false, error: 'Модуль не найден' }

  if (module._count.lessons > 0) {
    return {
      ok: false,
      error: `В модуле ${module._count.lessons} урок(ов). Перенесите их в другой модуль, иначе они пропадут из программы.`
    }
  }

  await prisma.module.delete({ where: { id } })
  revalidatePath(`/ru/admin/courses/${module.courseId}`)
  return { ok: true }
}

export async function moveModule(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  await requireAdmin()

  const module = await prisma.module.findUnique({
    where: { id },
    select: { id: true, courseId: true, order: true }
  })
  if (!module) return { ok: false, error: 'Модуль не найден' }

  const neighbour = await prisma.module.findFirst({
    where: {
      courseId: module.courseId,
      order: direction === 'up' ? { lt: module.order } : { gt: module.order }
    },
    orderBy: { order: direction === 'up' ? 'desc' : 'asc' },
    select: { id: true, order: true }
  })
  if (!neighbour) return { ok: true }

  await prisma.$transaction([
    prisma.module.update({ where: { id: module.id }, data: { order: -1 } }),
    prisma.module.update({ where: { id: neighbour.id }, data: { order: module.order } }),
    prisma.module.update({ where: { id: module.id }, data: { order: neighbour.order } })
  ])

  revalidatePath(`/ru/admin/courses/${module.courseId}`)
  return { ok: true }
}

export async function assignLessonToModule(
  lessonId: string,
  moduleId: string | null
): Promise<ActionResult> {
  await requireAdmin()

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { courseId: true }
  })
  if (!lesson) return { ok: false, error: 'Урок не найден' }

  if (moduleId) {
    const target = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true }
    })
    if (!target) return { ok: false, error: 'Модуль не найден' }
    if (target.courseId !== lesson.courseId) {
      return { ok: false, error: 'Модуль принадлежит другому курсу' }
    }
  }

  const last = await prisma.lesson.findFirst({
    where: { courseId: lesson.courseId, moduleId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { moduleId, order: (last?.order ?? -1) + 1 }
  })

  revalidatePath(`/ru/admin/courses/${lesson.courseId}`)
  return { ok: true }
}
