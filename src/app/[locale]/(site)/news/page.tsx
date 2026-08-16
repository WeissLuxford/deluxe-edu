import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function NewsListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'news' })

  const items = await prisma.news.findMany({
    where: { locale, published: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
    take: 50
  })

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">{t('title')}</h1>
          <p className="page-hero__sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container page-body">
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>{t('empty')}</h3>
            <p>{t('emptyHint')}</p>
          </div>
        ) : (
          <div className="news-grid">
            {items.map(n => (
              <article key={n.id} className="news-card">
                {n.coverUrl && (
                  <Link href={`/${locale}/news/${n.slug}`} className="news-card__cover">
                    <img src={n.coverUrl} alt="" loading="lazy" />
                  </Link>
                )}
                <div className="news-card__body">
                  <time className="news-card__date" dateTime={n.publishedAt?.toISOString()}>
                    <Calendar size={13} />
                    {n.publishedAt?.toLocaleDateString(locale, {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </time>
                  <h2 className="news-card__title">
                    <Link href={`/${locale}/news/${n.slug}`}>{n.title}</Link>
                  </h2>
                  <p className="news-card__lead">{n.lead}</p>
                  <Link href={`/${locale}/news/${n.slug}`} className="news-card__more">
                    {t('readMore')}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
