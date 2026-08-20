import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

export const dynamic = 'force-dynamic'

const LOCALES = ['ru', 'uz', 'en']

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params

  const item = await prisma.news.findFirst({
    where: { slug, published: true },
    select: {
      title: true,
      lead: true,
      metaTitle: true,
      metaDescription: true,
      coverUrl: true,
      publishedAt: true
    }
  })

  if (!item) return {}

  const languages: Record<string, string> = {}
  for (const l of LOCALES) {
    languages[l] = `/${l}/news/${slug}`
  }

  const title = localized(item.metaTitle, locale) || localized(item.title, locale)
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
  const t = await getTranslations({ locale, namespace: 'news' })

  const item = await prisma.news.findFirst({
    where: { slug, published: true, publishedAt: { lte: new Date() } }
  })

  if (!item) notFound()

  const body = localized(item.body, locale)
  const paragraphs = body.split(/\n\s*\n/).filter(Boolean)

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href={`/${locale}/news`}>{t('title')}</Link>
          </nav>

          <h1 className="page-hero__title news-article__title">{localized(item.title, locale)}</h1>

          <div className="course-hero__meta">
            <span>
              <Calendar size={15} />
              {item.publishedAt?.toLocaleDateString(locale, {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="container page-body">
        <article className="news-article">
          {item.coverUrl && (
            <img src={item.coverUrl} alt="" className="news-article__cover" />
          )}

          <p className="news-article__lead">{localized(item.lead, locale)}</p>

          {paragraphs.map((p, i) => (
            <p key={i} className="news-article__p">{p}</p>
          ))}
        </article>

        <Link href={`/${locale}/news`} className="btn btn-secondary">
          {t('backToList')}
        </Link>
      </div>
    </main>
  )
}
