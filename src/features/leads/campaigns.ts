import raw from '@/content/campaigns.json'

// Реестр рекламных лендингов. Держим в JSON, а не в базе: кампаний единицы, и
// добавить кампанию через PR честнее, чем строить под это экран в админке.
// Ключи, начинающиеся с $, — служебные комментарии внутри файла.

export type Campaign = {
  slug: string
  headline: Record<string, string>
  subhead: Record<string, string>
  offer: Record<string, string>
  bullets: Record<string, string[]>
  image: string
}

const entries = Object.entries(raw as Record<string, unknown>).filter(
  ([key]) => !key.startsWith('$')
) as [string, Omit<Campaign, 'slug'>][]

const BY_SLUG = new Map<string, Campaign>(
  entries.map(([slug, value]) => [slug, { slug, ...value }])
)

export function getCampaign(slug: string): Campaign | null {
  return BY_SLUG.get(slug) ?? null
}

export function campaignSlugs(): string[] {
  return [...BY_SLUG.keys()]
}

export function isKnownCampaign(slug: unknown): slug is string {
  return typeof slug === 'string' && BY_SLUG.has(slug)
}

/** Берём строку на нужном языке, откатываясь на русский: реклама не должна
 *  показывать пустое место из-за незаполненного перевода. */
export function pick<T>(field: Record<string, T>, locale: string): T {
  return field[locale] ?? field.ru
}
