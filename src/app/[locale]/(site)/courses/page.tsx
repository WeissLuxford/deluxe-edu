import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { Button } from '@/design/components/Button'
import { Reveal } from '@/design/components/Reveal'
import { Container, Heading } from '@/design/components/Type'
import { LEVEL_CODES, type LevelCode } from '@/design/levels'
import { catalogCourses, TOPICS, type Topic } from '@/features/courses/catalog'
import { CatalogGrid } from '@/features/courses/CatalogGrid'
import { formatSum } from '@/features/pricing/planPrices'
import s from '@/features/courses/catalog.module.css'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ level?: string; topic?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'coursesPage.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function CoursesPage({ params, searchParams }: Props) {
  const { locale } = await params
  const query = await searchParams
  const t = await getTranslations({ locale, namespace: 'coursesPage' })
  const tu = await getTranslations({ locale, namespace: 'ui' })
  const session = await getServerSession(authOptions)
  const courses = await catalogCourses(locale, session?.user?.id ?? null)

  const level = (LEVEL_CODES as string[]).includes(query.level ?? '') ? (query.level as LevelCode) : null
  const topic = (TOPICS as string[]).includes(query.topic ?? '') ? (query.topic as Topic) : null
  const fromLabels = Object.fromEntries(courses.map(c => [c.id, tu('from', { price: tu('perMonth', { price: tu('sum', { amount: formatSum(c.fromPrice) }) }) })]))

  const rich = {
    it: (c: ReactNode) => <span className="it">{c}</span>,
    a: (c: ReactNode) => <Link href={`/${locale}/level-test`}>{c}</Link>
  }

  return (
    <Container>
      <div className={s.head}>
        <Reveal>
          <Heading size="h1">{t.rich('title', rich)}</Heading>
        </Reveal>
        <Reveal delay={80}>
          <p className={s.hint}>{t.rich('hint', rich)}</p>
        </Reveal>
      </div>

      <CatalogGrid courses={courses} initialLevel={level} initialTopic={topic} fromLabels={fromLabels} />

      <Reveal className={s.trial}>
        <span className={s.trialText}>
          <span className={s.trialTitle}>{t.rich('trialTitle', rich)}</span>
          <span className={s.trialSub}>{t('trialText')}</span>
        </span>
        <Button href={`/${locale}/trial-lesson`} variant="lime" size="lg">
          {t('trialCta')}
        </Button>
      </Reveal>
    </Container>
  )
}
