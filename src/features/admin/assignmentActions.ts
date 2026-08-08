'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import type { ActionResult } from './actions'

const localized = z.object({
  ru: z.string().trim().min(1),
  uz: z.string().trim().default(''),
  en: z.string().trim().default('')
})

const optionSchema = z.object({
  value: z.string().trim().min(1),
  label: localized
})

const questionSchema = z.object({
  id: z.string().trim().min(1),
  type: z.enum(['single', 'multiple', 'text']),
  question: localized,
  options: z.array(optionSchema).default([]),
  /** Строка для single/text, массив для multiple */
  correct: z.union([z.string(), z.array(z.string())])
})

const payloadSchema = z.object({
  title: localized,
  questions: z.array(questionSchema).min(1, 'Нужен хотя бы один вопрос')
})

/**
 * Разделяет данные формы на две части:
 *  - prompt    уходит в браузер студента (вопросы и варианты, без ответов)
 *  - answerKey остаётся на сервере (правильные ответы)
 *
 * Смешивать их нельзя: всё, что попадает в prompt, студент видит в исходниках
 * страницы. Оценку считает сервер по answerKey — см. /api/lessons/submit.
 */
function split(questions: z.infer<typeof questionSchema>[]) {
  const prompt = {
    questions: questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      ...(q.options.length > 0 ? { options: q.options } : {})
    }))
  }

  const answerKey: Record<string, string | string[]> = {}
  for (const q of questions) {
    answerKey[q.id] = q.correct
  }

  return { prompt, answerKey }
}

function validate(questions: z.infer<typeof questionSchema>[]): string | null {
  for (const q of questions) {
    const label = q.question.ru || q.id

    if (q.type === 'text') {
      if (typeof q.correct !== 'string' || !q.correct.trim()) {
        return `«${label}»: укажите правильный ответ`
      }
      continue
    }

    if (q.options.length < 2) {
      return `«${label}»: нужно минимум два варианта ответа`
    }

    const values = q.options.map(o => o.value)
    if (new Set(values).size !== values.length) {
      return `«${label}»: варианты ответа повторяются`
    }

    const correct = Array.isArray(q.correct) ? q.correct : [q.correct]
    if (correct.length === 0 || correct.some(c => !c)) {
      return `«${label}»: отметьте правильный ответ`
    }
    if (correct.some(c => !values.includes(c))) {
      return `«${label}»: правильный ответ не совпадает ни с одним вариантом`
    }
    if (q.type === 'single' && correct.length !== 1) {
      return `«${label}»: у вопроса с одним ответом должен быть отмечен ровно один вариант`
    }
  }

  return null
}

export async function saveAssignment(
  lessonId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  await requireAdmin()

  let raw: unknown
  try {
    raw = JSON.parse(String(form.get('payload') ?? ''))
  } catch {
    return { ok: false, error: 'Не удалось прочитать форму' }
  }

  const parsed = payloadSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }

  const ids = parsed.data.questions.map(q => q.id)
  if (new Set(ids).size !== ids.length) {
    return { ok: false, error: 'Внутренние номера вопросов повторяются' }
  }

  const problem = validate(parsed.data.questions)
  if (problem) return { ok: false, error: problem }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } })
  if (!lesson) return { ok: false, error: 'Урок не найден' }

  const { prompt, answerKey } = split(parsed.data.questions)
  const existing = await prisma.assignment.findFirst({
    where: { lessonId },
    select: { id: true }
  })

  if (existing) {
    await prisma.assignment.update({
      where: { id: existing.id },
      data: { title: parsed.data.title, prompt, answerKey }
    })
  } else {
    await prisma.assignment.create({
      data: { lessonId, title: parsed.data.title, prompt, answerKey }
    })
  }

  // Тест есть — значит у урока должен стоять соответствующий флаг
  await prisma.lesson.update({ where: { id: lessonId }, data: { hasTest: true } })

  revalidatePath(`/ru/admin/lessons/${lessonId}`)
  return { ok: true }
}

export async function deleteAssignment(lessonId: string): Promise<ActionResult> {
  await requireAdmin()

  const existing = await prisma.assignment.findFirst({
    where: { lessonId },
    select: { id: true }
  })
  if (!existing) return { ok: true }

  await prisma.$transaction([
    prisma.submission.deleteMany({ where: { assignmentId: existing.id } }),
    prisma.assignment.delete({ where: { id: existing.id } }),
    prisma.lesson.update({ where: { id: lessonId }, data: { hasTest: false } })
  ])

  revalidatePath(`/ru/admin/lessons/${lessonId}`)
  return { ok: true }
}
