'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import type { ActionResult } from './actions'

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

function extractYoutubeId(raw: string): string {
  const value = raw.trim()
  if (!value) return ''

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
  ]

  for (const p of patterns) {
    const m = value.match(p)
    if (m) return m[1]
  }

  return /^[A-Za-z0-9_-]{11}$/.test(value) ? value : ''
}

const streamSchema = z
  .object({
    title: localized,
    description: localized,
    kind: z.enum(['YOUTUBE', 'ZOOM']),
    youtubeId: z.string().trim(),
    zoomJoinUrl: z.string().trim(),
    startsAt: z.date(),
    durationMin: z.number().int().min(5).max(600),
    recordingUrl: z.string().trim(),
    requiredPlan: z.enum(['FREE', 'BASIC', 'PRO', 'DELUXE']).nullable(),
    published: z.boolean()
  })
  .refine(d => d.kind !== 'YOUTUBE' || d.youtubeId.length > 0, {
    message: 'Для эфира YouTube нужна ссылка или идентификатор ролика'
  })
  .refine(d => d.kind !== 'ZOOM' || d.zoomJoinUrl.length > 0, {
    message: 'Для занятия в Zoom нужна ссылка входа'
  })

function readStream(form: FormData) {
  const kind = String(form.get('kind') ?? 'YOUTUBE') as 'YOUTUBE' | 'ZOOM'
  const plan = String(form.get('requiredPlan') ?? '')
  const startsAtRaw = String(form.get('startsAt') ?? '')

  return {
    title: readLocalized(form, 'title'),
    description: readLocalized(form, 'description'),
    kind,
    youtubeId: extractYoutubeId(String(form.get('youtubeId') ?? '')),
    zoomJoinUrl: String(form.get('zoomJoinUrl') ?? ''),
    startsAt: startsAtRaw ? new Date(startsAtRaw) : new Date(NaN),
    durationMin: Number(form.get('durationMin') ?? 60),
    recordingUrl: String(form.get('recordingUrl') ?? ''),
    requiredPlan: plan ? (plan as 'FREE' | 'BASIC' | 'PRO' | 'DELUXE') : null,
    published: form.get('published') === 'on'
  }
}

function toData(parsed: z.infer<typeof streamSchema>) {
  return {
    title: parsed.title,
    description: parsed.description,
    kind: parsed.kind,
    youtubeId: parsed.kind === 'YOUTUBE' ? parsed.youtubeId : null,
    zoomJoinUrl: parsed.kind === 'ZOOM' ? parsed.zoomJoinUrl : null,
    startsAt: parsed.startsAt,
    durationMin: parsed.durationMin,
    recordingUrl: parsed.recordingUrl || null,
    requiredPlan: parsed.requiredPlan,
    published: parsed.published
  }
}

export async function createStream(_prev: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()

  const raw = readStream(form)
  if (Number.isNaN(raw.startsAt.getTime())) {
    return { ok: false, error: 'Укажите дату и время начала' }
  }

  const parsed = streamSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  await prisma.stream.create({ data: toData(parsed.data) })
  revalidatePath('/ru/admin/streams')
  return { ok: true }
}

export async function updateStream(
  id: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  await requireAdmin()

  const raw = readStream(form)
  if (Number.isNaN(raw.startsAt.getTime())) {
    return { ok: false, error: 'Укажите дату и время начала' }
  }

  const parsed = streamSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  await prisma.stream.update({ where: { id }, data: toData(parsed.data) })
  revalidatePath('/ru/admin/streams')
  return { ok: true }
}

export async function deleteStream(id: string): Promise<ActionResult> {
  await requireAdmin()
  await prisma.stream.delete({ where: { id } })
  revalidatePath('/ru/admin/streams')
  return { ok: true }
}
