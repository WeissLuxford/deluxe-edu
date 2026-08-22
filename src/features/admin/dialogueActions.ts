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

const characterSchema = z.object({
  id: z.string().trim().min(1),
  name: localized
})

const lineSchema = z.object({
  id: z.string().trim().min(1),
  characterId: z.string().trim().min(1),
  text: localized,
  audioUrl: z.string().trim().min(1, 'Добавьте аудио для реплики')
})

const payloadSchema = z.object({
  title: localized,
  characters: z.array(characterSchema).min(2, 'Нужно минимум два персонажа'),
  lines: z.array(lineSchema).min(1, 'Добавьте хотя бы одну реплику')
})

export async function saveDialogue(lessonId: string, _prev: unknown, form: FormData): Promise<ActionResult> {
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

  const characterIds = new Set(parsed.data.characters.map(c => c.id))
  if (characterIds.size !== parsed.data.characters.length) {
    return { ok: false, error: 'Внутренние номера персонажей повторяются' }
  }

  for (const line of parsed.data.lines) {
    if (!characterIds.has(line.characterId)) {
      return { ok: false, error: 'У реплики указан несуществующий персонаж' }
    }
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } })
  if (!lesson) return { ok: false, error: 'Урок не найден' }

  const existing = await prisma.dialogue.findFirst({ where: { lessonId }, select: { id: true } })

  if (existing) {
    await prisma.dialogue.update({
      where: { id: existing.id },
      data: { title: parsed.data.title, characters: parsed.data.characters, lines: parsed.data.lines }
    })
  } else {
    await prisma.dialogue.create({
      data: {
        lessonId,
        title: parsed.data.title,
        characters: parsed.data.characters,
        lines: parsed.data.lines
      }
    })
  }

  await prisma.lesson.update({ where: { id: lessonId }, data: { hasDialogue: true } })

  revalidatePath(`/ru/admin/lessons/${lessonId}`)
  return { ok: true }
}

export async function deleteDialogue(lessonId: string): Promise<ActionResult> {
  await requireAdmin()

  const existing = await prisma.dialogue.findFirst({ where: { lessonId }, select: { id: true } })
  if (!existing) return { ok: true }

  const attempts = await prisma.dialogueAttempt.findMany({
    where: { dialogueId: existing.id },
    select: { id: true }
  })
  const attemptIds = attempts.map(a => a.id)

  await prisma.$transaction([
    prisma.dialogueLineRecording.deleteMany({ where: { attemptId: { in: attemptIds } } }),
    prisma.dialogueAttempt.deleteMany({ where: { dialogueId: existing.id } }),
    prisma.dialogue.delete({ where: { id: existing.id } }),
    prisma.lesson.update({ where: { id: lessonId }, data: { hasDialogue: false } })
  ])

  revalidatePath(`/ru/admin/lessons/${lessonId}`)
  return { ok: true }
}
