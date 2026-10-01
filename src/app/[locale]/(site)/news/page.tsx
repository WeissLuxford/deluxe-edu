import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { after } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { Reveal } from '@/design/components/Reveal'
import { Container, Heading } from '@/design/components/Type'
import { syncInstagram, instagramUsername } from '@/features/news/instagram'
import { NewsCard } from '@/features/news/NewsCard'
import s from '@/features/news/news.module.css'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'newsPage.meta' })
  return { title: t('title'), description: t('description'), alternates: { types: { 'application/rss+xml': `/${locale}/rss.xml` } } }
}

export default async function NewsListPage({ params }: Props) {
  const { locale } = await params
  const [t, items, username] = await Promise.all([
    getTranslations({ locale, namespace: 'newsPage' }),
    prisma.news.findMany({
      where: { published: true, publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 60,
      select: { id: true, slug: true, title: true, lead: true, coverUrl: true, publishedAt: true, instagramId: true }
    }),
    instagramUsername()
  ])
  // New Instagram posts arrive after the page is sent — the next visitor sees them.
  after(() => syncInstagram().catch(() => undefined))

  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }
  const [first, ...rest] = items

  return (
    <Container>
      <div className={s.head}>
        <Reveal>
          <Heading size="h1">{t.rich('title', rich)}</Heading>
        </Reveal>
        <Reveal delay={80} className={s.headSide}>
          <p className={s.lead}>{t('lead')}</p>
          {username && (
            <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className={s.igLink}>
              <span className={s.igMark} aria-hidden="true">
                IG
              </span>
              {t('instagram')} · @{username}
            </a>
          )}
        </Reveal>
      </div>

      {!first ? (
        <Reveal className={s.empty}>
          <span className={s.emptyTitle}>{t.rich('emptyTitle', rich)}</span>
          <p className={s.emptyText}>{t('emptyText')}</p>
        </Reveal>
      ) : (
        <div className={s.grid}>
          <NewsCard item={first} locale={locale} feature labels={{ fromInstagram: t('fromInstagram'), readMore: t('readMore') }} />
          {rest.map((n, i) => (
            <NewsCard key={n.id} item={n} locale={locale} index={i} labels={{ fromInstagram: t('fromInstagram'), readMore: t('readMore') }} />
          ))}
        </div>
      )}
    </Container>
  )
}
