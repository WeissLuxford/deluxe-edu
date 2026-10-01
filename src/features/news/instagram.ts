import { prisma } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { bunnyConfigured, uploadToBunny } from '@/lib/bunny'

// Instagram → site. The school publishes only in Instagram; new posts become
// news here. Uses the Instagram API with Instagram Login (professional account,
// permission instagram_business_basic). Photos are copied to Bunny because
// Instagram's media links expire after a few days.

const API = 'https://graph.instagram.com'
const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}'
const SYNC_EVERY_MS = 30 * 60 * 1000
const REFRESH_EVERY_MS = 7 * 24 * 60 * 60 * 1000
/** On the very first sync only this many recent posts come over, not the whole history. */
const FIRST_IMPORT = 12

const KEY = {
  token: 'instagram.token',
  tokenRefreshedAt: 'instagram.tokenRefreshedAt',
  username: 'instagram.username',
  watermark: 'instagram.watermark',
  lastSyncAt: 'instagram.lastSyncAt',
  lastError: 'instagram.lastError',
  lastImported: 'instagram.lastImported'
} as const

type Media = {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
  children?: { data: { media_type: string; media_url?: string; thumbnail_url?: string }[] }
}

export type SyncResult =
  | { ok: true; imported: number; skipped?: 'recent' }
  | { ok: false; reason: 'not_configured' | 'error'; error?: string }

async function getSetting(key: string) {
  const row = await prisma.appSetting.findUnique({ where: { key } })
  return row?.value ?? null
}

async function setSetting(key: string, value: string) {
  await prisma.appSetting.upsert({ where: { key }, create: { key, value }, update: { value } })
}

async function ig<T>(path: string, token: string): Promise<T> {
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`${API}${path}${sep}access_token=${encodeURIComponent(token)}`, { cache: 'no-store' })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error?.message || `Instagram ответил ${res.status}`)
  return data as T
}

/** Token from the database (kept fresh by refresh) or, the first time, from the environment. */
async function currentToken(): Promise<string | null> {
  return (await getSetting(KEY.token)) || process.env.INSTAGRAM_ACCESS_TOKEN || null
}

// Long-lived tokens live 60 days; refreshing weekly keeps them alive forever.
async function refreshIfDue(token: string): Promise<string> {
  const last = await getSetting(KEY.tokenRefreshedAt)
  if (last && Date.now() - Number(last) < REFRESH_EVERY_MS) return token
  try {
    const data = await ig<{ access_token: string }>(`/refresh_access_token?grant_type=ig_refresh_token`, token)
    await setSetting(KEY.token, data.access_token)
    await setSetting(KEY.tokenRefreshedAt, String(Date.now()))
    return data.access_token
  } catch {
    // A token younger than 24 hours can't be refreshed yet — try again next time.
    if (!last) await setSetting(KEY.tokenRefreshedAt, String(Date.now() - REFRESH_EVERY_MS + 24 * 60 * 60 * 1000))
    return token
  }
}

const HASHTAG_LINE = /^(?:\s*[#@][\p{L}\p{N}_.]+\s*)+$/u

/** Caption → title (first line), lead (next paragraph), body (the rest). */
export function splitCaption(caption: string | undefined, date: Date) {
  const lines = (caption ?? '')
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
  // Trailing blocks of hashtags and mentions are for Instagram, not for the site.
  while (lines.length && (lines[lines.length - 1] === '' || HASHTAG_LINE.test(lines[lines.length - 1]))) lines.pop()

  const paragraphs = lines
    .join('\n')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)

  const fallback = `Новость от ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Asia/Tashkent' })}`
  if (paragraphs.length === 0) return { title: fallback, lead: '', body: '' }

  const [firstLine, ...restOfFirst] = paragraphs[0].split('\n')
  let title = firstLine
  let leadStart = restOfFirst.join('\n').trim()

  // A long first line: the first sentence is the title, the rest goes to the lead.
  if (title.length > 110) {
    const cut = title.search(/[.!?…](\s|$)/)
    const head = cut > 20 && cut < 110 ? title.slice(0, cut + 1) : title.slice(0, 100).replace(/\s+\S*$/, '') + '…'
    leadStart = [title.slice(head.replace(/…$/, '').length).trim(), leadStart].filter(Boolean).join('\n')
    title = head
  }

  const rest = paragraphs.slice(1)
  const lead = leadStart || rest.shift() || ''
  return { title: title.replace(/[.:]$/, ''), lead, body: rest.join('\n\n') }
}

function coverSource(m: Media): string | null {
  if (m.media_type === 'IMAGE') return m.media_url ?? null
  if (m.media_type === 'VIDEO') return m.thumbnail_url ?? null
  const first = m.children?.data?.[0]
  if (!first) return m.media_url ?? null
  return first.media_type === 'VIDEO' ? (first.thumbnail_url ?? null) : (first.media_url ?? null)
}

async function copyCover(m: Media): Promise<string | null> {
  const src = coverSource(m)
  if (!src || !bunnyConfigured()) return null
  const res = await fetch(src, { cache: 'no-store' })
  if (!res.ok) return null
  const type = res.headers.get('content-type') || 'image/jpeg'
  const buffer = Buffer.from(await res.arrayBuffer())
  return uploadToBunny(buffer, `news/instagram/${m.id}.jpg`, type)
}

async function uniqueSlug(title: string, id: string) {
  const base = slugify(title).slice(0, 60).replace(/-+$/, '') || 'post'
  const slug = `${base}-${id.slice(-6)}`
  const taken = await prisma.news.findUnique({ where: { slug }, select: { id: true } })
  return taken ? `${base}-${id}` : slug
}

/**
 * Brings new Instagram posts over as published news. Runs at most every 30
 * minutes unless forced; posts older than the newest imported one are never
 * re-imported, so deleting a news item in the admin really removes it.
 */
export async function syncInstagram({ force = false } = {}): Promise<SyncResult> {
  let token = await currentToken()
  if (!token) return { ok: false, reason: 'not_configured' }

  const lastSync = Number((await getSetting(KEY.lastSyncAt)) ?? 0)
  if (!force && Date.now() - lastSync < SYNC_EVERY_MS) return { ok: true, imported: 0, skipped: 'recent' }
  // Mark the start first, so parallel page views don't all run the sync.
  await setSetting(KEY.lastSyncAt, String(Date.now()))

  try {
    token = await refreshIfDue(token)

    if (!(await getSetting(KEY.username))) {
      const me = await ig<{ username: string }>('/me?fields=username', token)
      await setSetting(KEY.username, me.username)
    }

    const watermark = await getSetting(KEY.watermark)
    const page = await ig<{ data: Media[] }>(`/me/media?fields=${encodeURIComponent(FIELDS)}&limit=25`, token)
    const fresh = page.data
      .filter(m => (watermark ? new Date(m.timestamp) > new Date(watermark) : true))
      .slice(0, watermark ? 25 : FIRST_IMPORT)
      .reverse()

    const known = new Set(
      (await prisma.news.findMany({ where: { instagramId: { in: fresh.map(m => m.id) } }, select: { instagramId: true } })).map(n => n.instagramId)
    )

    let imported = 0
    for (const m of fresh) {
      if (known.has(m.id)) continue
      const date = new Date(m.timestamp)
      const { title, lead, body } = splitCaption(m.caption, date)
      const coverUrl = await copyCover(m).catch(() => null)
      await prisma.news.create({
        data: {
          slug: await uniqueSlug(title, m.id),
          title: { ru: title },
          lead: { ru: lead },
          body: { ru: body },
          coverUrl,
          instagramId: m.id,
          instagramUrl: m.permalink,
          published: true,
          publishedAt: date
        }
      })
      imported += 1
    }

    const newest = page.data[0]?.timestamp
    if (newest && (!watermark || new Date(newest) > new Date(watermark))) await setSetting(KEY.watermark, newest)
    await setSetting(KEY.lastImported, String(imported))
    await prisma.appSetting.deleteMany({ where: { key: KEY.lastError } })
    return { ok: true, imported }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    await setSetting(KEY.lastError, error)
    return { ok: false, reason: 'error', error }
  }
}

/** What the admin sees: connected or not, when it last ran, what went wrong. */
export async function instagramStatus() {
  const rows = await prisma.appSetting.findMany({ where: { key: { startsWith: 'instagram.' } } })
  const get = (k: string) => rows.find(r => r.key === k)?.value ?? null
  return {
    configured: Boolean(get(KEY.token) || process.env.INSTAGRAM_ACCESS_TOKEN),
    username: get(KEY.username),
    lastSyncAt: get(KEY.lastSyncAt) ? new Date(Number(get(KEY.lastSyncAt))) : null,
    lastImported: get(KEY.lastImported) ? Number(get(KEY.lastImported)) : null,
    lastError: get(KEY.lastError),
    storesPhotos: bunnyConfigured()
  }
}

/** Public: the account to link to from the news page, once known. */
export async function instagramUsername() {
  return getSetting(KEY.username)
}
