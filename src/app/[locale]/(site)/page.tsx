import { Fragment } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { HOME_SECTIONS } from '@/features/home/sections'

const LOCALES = ['ru', 'uz', 'en'] as const
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  const url = `${SITE_URL}/${locale}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(LOCALES.map(l => [l, `${SITE_URL}/${l}`]))
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Highgate',
      locale,
      type: 'website'
    },
    robots: { index: true, follow: true }
  }
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const ctx = { locale, base: `/${locale}` }
  const t = await getTranslations({ locale, namespace: 'home' })
  const url = `${SITE_URL}/${locale}`

  const faqEntries = [1, 2, 3, 4, 5, 6, 7].map(n => ({
    question: t(`fq${n}`),
    answer: t(`fa${n}`)
  }))

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Highgate',
      url,
      description: t('metaDescription')
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntries.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer }
      }))
    }
  ]

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {HOME_SECTIONS.filter(section => section.enabled).map(section => (
        <Fragment key={section.key}>{section.render(ctx)}</Fragment>
      ))}
    </main>
  )
}
