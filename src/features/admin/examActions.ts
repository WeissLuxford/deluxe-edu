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
  correct: z.union([z.string(), z.array(z.string())])
})

const payloadSchema = z.object({
  title: localized,
  passingScore: z.number().int().min(1).max(100),
  questions: z.array(questionSchema).min(1, 'Нужен хотя бы один вопрос')
})

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

export async function saveExam(moduleId: string, _prev: unknown, form: FormData): Promise<ActionResult> {
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

  const module = await prisma.module.findUnique({ where: { id: moduleId }, select: { id: true, courseId: true } })
  if (!module) return { ok: false, error: 'Модуль не найден' }

  const { prompt, answerKey } = split(parsed.data.questions)
  const existing = await prisma.exam.findUnique({ where: { moduleId }, select: { id: true } })

  if (existing) {
    await prisma.exam.update({
      where: { id: existing.id },
      data: { title: parsed.data.title, prompt, answerKey, passingScore: parsed.data.passingScore }
    })
  } else {
    await prisma.exam.create({
      data: {
        moduleId,
        title: parsed.data.title,
        prompt,
        answerKey,
        passingScore: parsed.data.passingScore
      }
    })
  }

  revalidatePath(`/ru/admin/courses/${module.courseId}`)
  revalidatePath(`/ru/admin/courses/${module.courseId}/modules/${moduleId}/exam`)
  return { ok: true }
}

export async function deleteExam(moduleId: string): Promise<ActionResult> {
  await requireAdmin()

  const module = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } })
  if (!module) return { ok: false, error: 'Модуль не найден' }

  const existing = await prisma.exam.findUnique({ where: { moduleId }, select: { id: true } })
  if (!existing) return { ok: true }

  await prisma.$transaction([
    prisma.examAttempt.deleteMany({ where: { examId: existing.id } }),
    prisma.exam.delete({ where: { id: existing.id } })
  ])

  revalidatePath(`/ru/admin/courses/${module.courseId}`)
  revalidatePath(`/ru/admin/courses/${module.courseId}/modules/${moduleId}/exam`)
  return { ok: true }
}
