import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { RichText } from '@/features/ui/components/RichText'

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

  return (
    <main>
      <nav>
        <Link href={`/${locale}/news`}>{t('title')}</Link>
      </nav>

      <h1>{localized(item.title, locale)}</h1>

      <span>
        <Calendar size={15} />
        {item.publishedAt?.toLocaleDateString(locale, {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}
      </span>

      <article>
        {item.coverUrl && <img src={item.coverUrl} alt="" />}

        <p>{localized(item.lead, locale)}</p>

        <RichText text={body} />
      </article>

      <Link href={`/${locale}/news`}>{t('backToList')}</Link>
    </main>
  )
}
