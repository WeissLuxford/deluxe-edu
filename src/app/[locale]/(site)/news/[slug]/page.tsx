import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { RichText } from '@/design/components/RichText'
import { Reveal } from '@/design/components/Reveal'
import { Container } from '@/design/components/Type'
import { NewsCard, newsDate } from '@/features/news/NewsCard'
import s from '@/features/news/news.module.css'

export const dynamic = 'force-dynamic'

const LOCALES = ['ru', 'uz', 'en']

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params

  const item = await prisma.news.findFirst({
    where: { slug, published: true },
    select: { title: true, lead: true, metaTitle: true, metaDescription: true, coverUrl: true, publishedAt: true }
  })

  if (!item) return {}

  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l] = `/${l}/news/${slug}`

  const title = localized(item.metaTitle, locale) || `${localized(item.title, locale)} — Highgate`
  const description = localized(item.metaDescription, locale) || localized(item.lead, locale)

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/news/${slug}`, languages },
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: item.publishedAt?.toISOString(),
      images: item.coverUrl ? [item.coverUrl] : undefined
    }
  }
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'newsPage' })

  const item = await prisma.news.findFirst({
    where: { slug, published: true, publishedAt: { lte: new Date() } }
  })
  if (!item) notFound()

  const more = await prisma.news.findMany({
    where: { published: true, publishedAt: { lte: new Date() }, id: { not: item.id } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { id: true, slug: true, title: true, lead: true, coverUrl: true, publishedAt: true, instagramId: true }
  })

  const lead = localized(item.lead, locale)
  const body = localized(item.body, locale)
  const labels = { fromInstagram: t('fromInstagram'), readMore: t('readMore') }

  return (
    <Container>
      <article className={s.article}>
        <Reveal className={s.articleHead}>
          <Link href={`/${locale}/news`} className={s.back}>
            ← {t('back')}
          </Link>
          <span className={s.meta}>
            <time dateTime={item.publishedAt?.toISOString()}>{newsDate(item.publishedAt, locale)}</time>
            {item.instagramId && <span className={s.igChip}>{t('fromInstagram')}</span>}
          </span>
          <h1 className={s.articleTitle}>{localized(item.title, locale)}</h1>
          {lead && <p className={s.articleLead}>{lead}</p>}
        </Reveal>

        {item.coverUrl && (
          <Reveal delay={80} className={s.articleCover}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.coverUrl} alt="" />
          </Reveal>
        )}

        {body && (
          <Reveal delay={120} className={s.articleBody}>
            <RichText text={body} />
          </Reveal>
        )}

        {item.instagramUrl && (
          <Reveal delay={140}>
            <a href={item.instagramUrl} target="_blank" rel="noreferrer" className={s.igButton}>
              <span className={s.igMark} aria-hidden="true">
                IG
              </span>
              {t('openPost')}
            </a>
          </Reveal>
        )}
      </article>

      {more.length > 0 && (
        <section className={s.more}>
          <h2 className={s.moreTitle}>{t('more')}</h2>
          <div className={s.grid}>
            {more.map((n, i) => (
              <NewsCard key={n.id} item={n} locale={locale} index={i} labels={labels} />
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
