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

const optionalLocalized = z.object({
  ru: z.string().trim().default(''),
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

function pruneEmpty(value: { ru: string; uz: string; en: string }): Record<string, string> | null {
  const entries = Object.entries(value).filter(([, v]) => v.trim().length > 0)
  if (entries.length === 0) return null
  return Object.fromEntries(entries)
}

const newsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Только латиница в нижнем регистре, цифры и дефис'),
  title: localized,
  lead: localized.extend({ ru: z.string().trim().min(10, 'Анонс обязателен') }),
  body: localized.extend({ ru: z.string().trim().min(20, 'Текст обязателен') }),
  metaTitle: optionalLocalized,
  metaDescription: optionalLocalized,
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
    slug: String(form.get('slug') ?? ''),
    title: readLocalized(form, 'title'),
    lead: readLocalized(form, 'lead'),
    body: readLocalized(form, 'body'),
    metaTitle: readLocalized(form, 'metaTitle'),
    metaDescription: readLocalized(form, 'metaDescription'),
    coverUrl: clean('coverUrl'),
    published: form.get('published') === 'on',
    publishedAt: dateRaw ? new Date(dateRaw) : new Date()
  }
}

function toData(parsed: z.infer<typeof newsSchema>) {
  return {
    slug: parsed.slug,
    title: parsed.title,
    lead: parsed.lead,
    body: parsed.body,
    metaTitle: pruneEmpty(parsed.metaTitle) ?? undefined,
    metaDescription: pruneEmpty(parsed.metaDescription) ?? undefined,
    coverUrl: parsed.coverUrl,
    published: parsed.published,
    publishedAt: parsed.publishedAt
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
    where: { slug: parsed.data.slug },
    select: { id: true }
  })
  if (clash) return { ok: false, error: 'Новость с таким адресом уже есть' }

  await prisma.news.create({ data: toData(parsed.data) })
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
    where: { slug: parsed.data.slug, id: { not: id } },
    select: { id: true }
  })
  if (clash) return { ok: false, error: 'Новость с таким адресом уже есть' }

  await prisma.news.update({ where: { id }, data: toData(parsed.data) })
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
