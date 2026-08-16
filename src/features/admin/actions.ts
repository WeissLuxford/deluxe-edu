'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from './requireAdmin'

const localized = z.object({
  ru: z.string().trim().min(1, 'Русский текст обязателен'),
  uz: z.string().trim().default(''),
  en: z.string().trim().default('')
})

function readLocalized(form: FormData, prefix: string) {
  return {
    ru: String(form.get(`${prefix}_ru`) ?? ''),
    uz: String(form.get(`${prefix}_uz`) ?? ''),
    en: String(form.get(`${prefix}_en`) ?? '')
  }
}

export type ActionResult = { ok: boolean; error?: string }

const courseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Только латиница в нижнем регистре, цифры и дефис'),
  title: localized,
  description: localized,
  level: z.string().trim().min(1),
  priceBasic: z.number().int().min(0),
  pricePro: z.number().int().min(0),
  priceDeluxe: z.number().int().min(0),
  published: z.boolean(),
  visible: z.boolean()
})

function readCourse(form: FormData) {
  return {
    slug: String(form.get('slug') ?? ''),
    title: readLocalized(form, 'title'),
    description: readLocalized(form, 'description'),
    level: String(form.get('level') ?? 'Beginner'),
    priceBasic: Number(form.get('priceBasic') ?? 0),
    pricePro: Number(form.get('pricePro') ?? 0),
    priceDeluxe: Number(form.get('priceDeluxe') ?? 0),
    published: form.get('published') === 'on',
    visible: form.get('visible') === 'on'
  }
}

export async function createCourse(_prev: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()

  const parsed = courseSchema.safeParse(readCourse(form))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }

  const exists = await prisma.course.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) return { ok: false, error: 'Курс с таким адресом уже есть' }

  await prisma.course.create({ data: parsed.data })
  revalidatePath('/ru/admin/courses')
  return { ok: true }
}

export async function updateCourse(id: string, _prev: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()

  const parsed = courseSchema.safeParse(readCourse(form))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }

  const clash = await prisma.course.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
    select: { id: true }
  })
  if (clash) return { ok: false, error: 'Курс с таким адресом уже есть' }

  await prisma.course.update({ where: { id }, data: parsed.data })
  revalidatePath('/ru/admin/courses')
  revalidatePath(`/ru/admin/courses/${id}`)
  return { ok: true }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  await requireAdmin()

  const enrollments = await prisma.enrollment.count({ where: { courseId: id } })
  if (enrollments > 0) {
    return {
      ok: false,
      error: `Нельзя удалить: на курс записано ${enrollments} чел. Снимите его с публикации вместо удаления.`
    }
  }

  const lessons = await prisma.lesson.findMany({ where: { courseId: id }, select: { id: true } })
  const lessonIds = lessons.map(l => l.id)

  await prisma.$transaction([
    prisma.submission.deleteMany({ where: { assignment: { lessonId: { in: lessonIds } } } }),
    prisma.assignment.deleteMany({ where: { lessonId: { in: lessonIds } } }),
    prisma.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } }),
    prisma.lesson.deleteMany({ where: { courseId: id } }),
    prisma.payment.deleteMany({ where: { courseId: id } }),
    prisma.course.delete({ where: { id } })
  ])

  revalidatePath('/ru/admin/courses')
  return { ok: true }
}

const lessonSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Только латиница в нижнем регистре, цифры и дефис'),
  title: localized,
  content: localized,
  order: z.number().int().min(0),
  hasVideo: z.boolean(),
  hasConspect: z.boolean(),
  hasTest: z.boolean(),
  zoomMeetingId: z.string().trim().nullable()
})

function readLesson(form: FormData) {
  const zoom = String(form.get('zoomMeetingId') ?? '').trim()
  return {
    slug: String(form.get('slug') ?? ''),
    title: readLocalized(form, 'title'),
    content: readLocalized(form, 'content'),
    order: Number(form.get('order') ?? 0),
    hasVideo: form.get('hasVideo') === 'on',
    hasConspect: form.get('hasConspect') === 'on',
    hasTest: form.get('hasTest') === 'on',
    zoomMeetingId: zoom || null
  }
}

export async function createLesson(courseId: string, _prev: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()

  const parsed = lessonSchema.safeParse(readLesson(form))
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const clash = await prisma.lesson.findFirst({
    where: { courseId, slug: parsed.data.slug },
    select: { id: true }
  })
  if (clash) return { ok: false, error: 'Урок с таким адресом уже есть в этом курсе' }

  await prisma.lesson.create({ data: { ...parsed.data, courseId } })
  revalidatePath(`/ru/admin/courses/${courseId}`)
  return { ok: true }
}

export async function updateLesson(id: string, _prev: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()

  const parsed = lessonSchema.safeParse(readLesson(form))
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const lesson = await prisma.lesson.findUnique({ where: { id }, select: { courseId: true } })
  if (!lesson) return { ok: false, error: 'Урок не найден' }

  const clash = await prisma.lesson.findFirst({
    where: { courseId: lesson.courseId, slug: parsed.data.slug, id: { not: id } },
    select: { id: true }
  })
  if (clash) return { ok: false, error: 'Урок с таким адресом уже есть в этом курсе' }

  await prisma.lesson.update({ where: { id }, data: parsed.data })
  revalidatePath(`/ru/admin/lessons/${id}`)
  revalidatePath(`/ru/admin/courses/${lesson.courseId}`)
  return { ok: true }
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  await requireAdmin()

  const lesson = await prisma.lesson.findUnique({ where: { id }, select: { courseId: true } })
  if (!lesson) return { ok: false, error: 'Урок не найден' }

  await prisma.$transaction([
    prisma.submission.deleteMany({ where: { assignment: { lessonId: id } } }),
    prisma.assignment.deleteMany({ where: { lessonId: id } }),
    prisma.lessonProgress.deleteMany({ where: { lessonId: id } }),
    prisma.lesson.delete({ where: { id } })
  ])

  revalidatePath(`/ru/admin/courses/${lesson.courseId}`)
  return { ok: true }
}

export async function setContactStatus(
  id: string,
  status: 'NEW' | 'CONTACTED' | 'RESOLVED' | 'SPAM'
): Promise<ActionResult> {
  await requireAdmin()
  await prisma.contactRequest.update({ where: { id }, data: { status } })
  revalidatePath('/ru/admin/contacts')
  return { ok: true }
}

const PLANS = ['FREE', 'BASIC', 'PRO', 'DELUXE'] as const
type Plan = (typeof PLANS)[number]

export async function enrollUser(_prev: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()

  const userId = String(form.get('userId') ?? '')
  const courseId = String(form.get('courseId') ?? '')
  const plan = String(form.get('plan') ?? 'BASIC') as Plan

  if (!userId || !courseId) return { ok: false, error: 'Выберите пользователя и курс' }
  if (!PLANS.includes(plan)) return { ok: false, error: 'Неизвестный тариф' }

  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
  ])
  if (!user) return { ok: false, error: 'Пользователь не найден' }
  if (!course) return { ok: false, error: 'Курс не найден' }

  const existing = await prisma.enrollment.findFirst({ where: { userId, courseId } })

  if (existing) {
    await prisma.enrollment.update({
      where: { id: existing.id },
      data: { status: 'ACTIVE', plan }
    })
  } else {
    await prisma.enrollment.create({
      data: { userId, courseId, plan, status: 'ACTIVE' }
    })
  }

  revalidatePath('/ru/admin/students')
  return { ok: true }
}

export async function revokeEnrollment(id: string): Promise<ActionResult> {
  await requireAdmin()

  await prisma.enrollment.update({ where: { id }, data: { status: 'CANCELED' } })
  revalidatePath('/ru/admin/students')
  return { ok: true }
}
