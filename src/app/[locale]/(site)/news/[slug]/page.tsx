import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params

  const item = await prisma.news.findFirst({
    where: { locale, slug, published: true },
    select: {
      title: true,
      lead: true,
      metaTitle: true,
      metaDescription: true,
      coverUrl: true,
      groupId: true,
      publishedAt: true
    }
  })

  if (!item) return {}

  const siblings = await prisma.news.findMany({
    where: { groupId: item.groupId, published: true },
    select: { locale: true, slug: true }
  })

  const languages: Record<string, string> = {}
  for (const s of siblings) {
    languages[s.locale] = `/${s.locale}/news/${s.slug}`
  }

  return {
    title: item.metaTitle || item.title,
    description: item.metaDescription || item.lead,
    alternates: { canonical: `/${locale}/news/${slug}`, languages },
    openGraph: {
      type: 'article',
      title: item.metaTitle || item.title,
      description: item.metaDescription || item.lead,
      publishedTime: item.publishedAt?.toISOString(),
      images: item.coverUrl ? [item.coverUrl] : undefined
    }
  }
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'news' })

  const item = await prisma.news.findFirst({
    where: { locale, slug, published: true, publishedAt: { lte: new Date() } }
  })

  if (!item) notFound()

  const paragraphs = item.body.split(/\n\s*\n/).filter(Boolean)

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href={`/${locale}/news`}>{t('title')}</Link>
          </nav>

          <h1 className="page-hero__title news-article__title">{item.title}</h1>

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

          <p className="news-article__lead">{item.lead}</p>

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
