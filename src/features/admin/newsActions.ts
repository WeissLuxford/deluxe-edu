'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import type { ActionResult } from './actions'

const newsSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Только латиница в нижнем регистре, цифры и дефис'),
  title: z.string().trim().min(3, 'Заголовок обязателен'),
  lead: z.string().trim().min(10, 'Анонс обязателен'),
  body: z.string().trim().min(20, 'Текст обязателен'),
  metaTitle: z.string().trim().max(70).nullable(),
  metaDescription: z.string().trim().max(170).nullable(),
  coverUrl: z.string().trim().nullable(),
  published: z.boolean(),
  publishedAt: z.date()
})

function read(form: FormData) {
  const clean = (key: string) => {
    const v = String(form.get(key) ?? '').trim()
    return v || null
  }
  const dateRaw = String(form.get('publishedAt') ?? '')

  return {
    locale: String(form.get('locale') ?? 'ru') as 'ru' | 'uz' | 'en',
    slug: String(form.get('slug') ?? ''),
    title: String(form.get('title') ?? ''),
    lead: String(form.get('lead') ?? ''),
    body: String(form.get('body') ?? ''),
    metaTitle: clean('metaTitle'),
    metaDescription: clean('metaDescription'),
    coverUrl: clean('coverUrl'),
    published: form.get('published') === 'on',
    publishedAt: dateRaw ? new Date(dateRaw) : new Date()
  }
}

export async function createNews(_prev: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()

  const raw = read(form)
  if (Number.isNaN(raw.publishedAt.getTime())) {
    return { ok: false, error: 'Укажите дату публикации' }
  }

  const parsed = newsSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const clash = await prisma.news.findFirst({
    where: { locale: parsed.data.locale, slug: parsed.data.slug },
    select: { id: true }
  })
  if (clash) return { ok: false, error: 'Новость с таким адресом на этом языке уже есть' }

  const groupId = String(form.get('groupId') ?? '').trim() || crypto.randomUUID()

  await prisma.news.create({ data: { ...parsed.data, groupId } })
  revalidatePath('/ru/admin/news')
  return { ok: true }
}

export async function updateNews(id: string, _prev: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()

  const raw = read(form)
  if (Number.isNaN(raw.publishedAt.getTime())) {
    return { ok: false, error: 'Укажите дату публикации' }
  }

  const parsed = newsSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const clash = await prisma.news.findFirst({
    where: { locale: parsed.data.locale, slug: parsed.data.slug, id: { not: id } },
    select: { id: true }
  })
  if (clash) return { ok: false, error: 'Новость с таким адресом на этом языке уже есть' }

  await prisma.news.update({ where: { id }, data: parsed.data })
  revalidatePath('/ru/admin/news')
  return { ok: true }
}

export async function deleteNews(id: string): Promise<ActionResult> {
  await requireAdmin()
  await prisma.news.delete({ where: { id } })
  revalidatePath('/ru/admin/news')
  return { ok: true }
}

export async function toggleNewsPublished(id: string): Promise<ActionResult> {
  await requireAdmin()

  const item = await prisma.news.findUnique({ where: { id }, select: { published: true } })
  if (!item) return { ok: false, error: 'Новость не найдена' }

  await prisma.news.update({ where: { id }, data: { published: !item.published } })
  revalidatePath('/ru/admin/news')
  return { ok: true }
}
