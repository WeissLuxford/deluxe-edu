import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export type L10n = { ru: string; uz: string; en: string }

// Три языка всегда рядом: если строку забыли перевести, это видно прямо здесь,
// а не всплывает пустотой на сайте.
export const l = (ru: string, uz: string, en: string): L10n => ({ ru, uz, en })

export type Option = { value: string; label: L10n }

export type Question = {
  id: string
  type: 'single' | 'multiple' | 'text'
  question: L10n
  options?: Option[]
  correct: string | string[]
}

export function assignmentData(title: L10n, questions: Question[]) {
  return {
    title,
    prompt: {
      questions: questions.map(({ correct: _correct, ...rest }) => rest)
    },
    answerKey: Object.fromEntries(questions.map(q => [q.id, q.correct]))
  }
}

// Варианты ответов на английском одинаковы во всех трёх локалях: это материал
// урока, а не интерфейс. Переводить `goes` бессмысленно.
export const en3 = (value: string): L10n => l(value, value, value)

export function opts(...values: string[]): Option[] {
  return values.map((value, index) => ({
    value: String.fromCharCode(97 + index),
    label: en3(value)
  }))
}

export async function upsertLesson(
  courseId: string,
  moduleId: string | null,
  lesson: {
    slug: string
    title: L10n
    content: L10n
    order: number
    hasVideo?: boolean
    hasConspect?: boolean
    hasTest?: boolean
    videoUrl?: string | null
    durationMin?: number | null
  },
  test?: { title: L10n; questions: Question[] }
) {
  const data = {
    moduleId,
    title: lesson.title,
    content: lesson.content,
    order: lesson.order,
    hasVideo: lesson.hasVideo ?? true,
    hasConspect: lesson.hasConspect ?? true,
    hasTest: Boolean(test),
    videoUrl: lesson.videoUrl ?? null,
    durationMin: lesson.durationMin ?? null
  }

  const saved = await prisma.lesson.upsert({
    where: { courseId_slug: { courseId, slug: lesson.slug } },
    update: data,
    create: { courseId, slug: lesson.slug, ...data }
  })

  if (test) {
    const payload = assignmentData(test.title, test.questions)
    const existing = await prisma.assignment.findFirst({ where: { lessonId: saved.id } })

    if (existing) {
      await prisma.assignment.update({ where: { id: existing.id }, data: payload })
    } else {
      await prisma.assignment.create({ data: { lessonId: saved.id, ...payload } })
    }
  }

  return saved
}

export async function upsertModule(
  courseId: string,
  module: { title: L10n; description?: L10n; order: number }
) {
  const existing = await prisma.module.findFirst({
    where: { courseId, order: module.order }
  })

  const data = {
    title: module.title,
    description: module.description ?? null,
    order: module.order
  }

  if (existing) {
    return prisma.module.update({ where: { id: existing.id }, data })
  }

  return prisma.module.create({ data: { courseId, ...data } })
}

export async function courseIdBySlug(slug: string) {
  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
  return course?.id ?? null
}
