import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

export const dynamic = 'force-dynamic'

export default async function NewsListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'news' })

  const items = await prisma.news.findMany({
    where: { published: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
    take: 50
  })

  return (
    <main>
      <div>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </div>

      <div>
        {items.length === 0 ? (
          <div>
            <h3>{t('empty')}</h3>
            <p>{t('emptyHint')}</p>
          </div>
        ) : (
          <div>
            {items.map(n => (
              <article key={n.id}>
                {n.coverUrl && (
                  <Link href={`/${locale}/news/${n.slug}`}>
                    <img src={n.coverUrl} alt="" loading="lazy" />
                  </Link>
                )}
                <time dateTime={n.publishedAt?.toISOString()}>
                  <Calendar size={13} />
                  {n.publishedAt?.toLocaleDateString(locale, {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
                <h2>
                  <Link href={`/${locale}/news/${n.slug}`}>{localized(n.title, locale)}</Link>
                </h2>
                <p>{localized(n.lead, locale)}</p>
                <Link href={`/${locale}/news/${n.slug}`}>{t('readMore')}</Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
