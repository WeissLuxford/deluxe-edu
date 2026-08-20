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
  visible: z.boolean(),
  coverUrl: z.string().trim().nullable(),
  badge: z.string().trim().max(40).nullable()
})

function readCourse(form: FormData) {
  const cover = String(form.get('coverUrl') ?? '').trim()
  const badge = String(form.get('badge') ?? '').trim()

  return {
    slug: String(form.get('slug') ?? ''),
    title: readLocalized(form, 'title'),
    description: readLocalized(form, 'description'),
    level: String(form.get('level') ?? 'Beginner'),
    priceBasic: Number(form.get('priceBasic') ?? 0),
    pricePro: Number(form.get('pricePro') ?? 0),
    priceDeluxe: Number(form.get('priceDeluxe') ?? 0),
    published: form.get('published') === 'on',
    visible: form.get('visible') === 'on',
    coverUrl: cover || null,
    badge: badge || null
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
  videoUrl: z.string().trim().nullable(),
  zoomMeetingId: z.string().trim().nullable(),
  moduleId: z.string().trim().nullable(),
  coverUrl: z.string().trim().nullable(),
  durationMin: z.number().int().min(0).max(600).nullable()
})

function readLesson(form: FormData) {
  const zoom = String(form.get('zoomMeetingId') ?? '').trim()
  const video = String(form.get('videoUrl') ?? '').trim()
  const cover = String(form.get('coverUrl') ?? '').trim()
  const moduleId = String(form.get('moduleId') ?? '').trim()
  const duration = String(form.get('durationMin') ?? '').trim()

  return {
    slug: String(form.get('slug') ?? ''),
    title: readLocalized(form, 'title'),
    content: readLocalized(form, 'content'),
    order: Number(form.get('order') ?? 0),
    hasVideo: form.get('hasVideo') === 'on',
    hasConspect: form.get('hasConspect') === 'on',
    hasTest: form.get('hasTest') === 'on',
    videoUrl: video || null,
    zoomMeetingId: zoom || null,
    moduleId: moduleId || null,
    coverUrl: cover || null,
    durationMin: duration ? Number(duration) : null
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

const ROLES = ['STUDENT', 'MENTOR', 'ADMIN'] as const
type Role = (typeof ROLES)[number]

// Права выдаются уже зарегистрированному человеку, а не заводятся отдельной
// учёткой с паролем: пароль, который придумал администратор, всё равно
// пришлось бы передавать в мессенджере.
export async function setUserRole(userId: string, role: Role): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (!ROLES.includes(role)) return { ok: false, error: 'Неизвестная роль' }
  if (userId === admin.id) return { ok: false, error: 'Свою роль менять нельзя' }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  })
  if (!user) return { ok: false, error: 'Пользователь не найден' }
  if (user.role === role) return { ok: true }

  if (user.role === 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (admins <= 1) return { ok: false, error: 'Это последний администратор' }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/ru/admin/students')
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

// Удалять можно только STUDENT: у преподавателей и админов есть группы,
// расписание и другие завязки, которые так просто не подчистить.
export async function deleteUser(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin()

  if (userId === admin.id) return { ok: false, error: 'Себя удалить нельзя' }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
  if (!user) return { ok: false, error: 'Пользователь не найден' }
  if (user.role !== 'STUDENT') return { ok: false, error: 'Удалять можно только студентов' }

  await prisma.$transaction([
    prisma.submission.deleteMany({ where: { userId } }),
    prisma.payment.deleteMany({ where: { userId } }),
    prisma.lessonProgress.deleteMany({ where: { userId } }),
    prisma.enrollment.deleteMany({ where: { userId } }),
    prisma.verificationToken.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } })
  ])

  revalidatePath('/ru/admin/students')
  return { ok: true }
}

export async function moveLesson(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  await requireAdmin()

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true, courseId: true, order: true, moduleId: true }
  })
  if (!lesson) return { ok: false, error: 'Урок не найден' }

  const neighbour = await prisma.lesson.findFirst({
    where: {
      courseId: lesson.courseId,
      moduleId: lesson.moduleId,
      order: direction === 'up' ? { lt: lesson.order } : { gt: lesson.order }
    },
    orderBy: { order: direction === 'up' ? 'desc' : 'asc' },
    select: { id: true, order: true }
  })
  if (!neighbour) return { ok: true }

  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lesson.id }, data: { order: -1 } }),
    prisma.lesson.update({ where: { id: neighbour.id }, data: { order: lesson.order } }),
    prisma.lesson.update({ where: { id: lesson.id }, data: { order: neighbour.order } })
  ])

  revalidatePath(`/ru/admin/courses/${lesson.courseId}`)
  return { ok: true }
}

export async function toggleCoursePublished(id: string): Promise<ActionResult> {
  await requireAdmin()

  const course = await prisma.course.findUnique({ where: { id }, select: { published: true } })
  if (!course) return { ok: false, error: 'Курс не найден' }

  await prisma.course.update({ where: { id }, data: { published: !course.published } })
  revalidatePath('/ru/admin/courses')
  return { ok: true }
}
