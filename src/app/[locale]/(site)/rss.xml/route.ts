import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

const SUPPORTED = ['ru', 'uz', 'en']

const CHANNEL: Record<string, { title: string; description: string }> = {
  ru: { title: 'Highgate — новости', description: 'Новости платформы Highgate' },
  uz: { title: 'Highgate — yangiliklar', description: 'Highgate platformasi yangiliklari' },
  en: { title: 'Highgate — news', description: 'News from the Highgate platform' }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!SUPPORTED.includes(locale)) {
    return new Response('Not found', { status: 404 })
  }

  const site = (process.env.NEXTAUTH_URL || 'https://highgate.uz').replace(/\/$/, '')

  const items = await prisma.news.findMany({
    where: { published: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
    take: 50
  })

  const channel = CHANNEL[locale]

  const entries = items
    .map(n => {
      const url = `${site}/${locale}/news/${n.slug}`
      return `    <item>
      <title>${escapeXml(localized(n.title, locale))}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(localized(n.lead, locale))}</description>
      <pubDate>${(n.publishedAt ?? n.createdAt).toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${site}/${locale}/news</link>
    <description>${escapeXml(channel.description)}</description>
    <language>${locale}</language>
    <atom:link href="${site}/${locale}/rss.xml" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600'
    }
  })
}
