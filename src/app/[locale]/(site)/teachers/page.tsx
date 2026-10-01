import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/design/components/Button'
import { Reveal } from '@/design/components/Reveal'
import { Container, Heading } from '@/design/components/Type'
import { personJsonLd } from '@/features/seo/jsonLd'
import { publishedTeachers } from '@/features/teachers/registry'
import { FeaturedTeacher, TeacherCards, firstName } from '@/features/teachers/TeacherBits'
import s from '@/features/site/info.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'teachersPage.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function TeachersPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'teachersPage' })
  const teachers = publishedTeachers()
  const [featured, ...rest] = teachers
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  return (
    <Container>
      {teachers.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teachers.map(teacher => personJsonLd(teacher, locale))) }} />
      )}

      <div className={s.head}>
        <Reveal>
          <Heading size="h1">{t.rich('title', rich)}</Heading>
        </Reveal>
        <Reveal delay={80}>
          <p className={s.lead}>{t('lead')}</p>
        </Reveal>
      </div>

      {!featured ? (
        <Reveal className={s.empty}>
          <div>
            <span className={s.emptyTitle}>{t.rich('emptyTitle', rich)}</span>
            <p className={s.emptyText}>{t('emptyText')}</p>
          </div>
          <Button href={`/${locale}/trial-lesson`} size="lg" arrow>
            {t('emptyCta')}
          </Button>
        </Reveal>
      ) : (
        <>
          <FeaturedTeacher
            teacher={featured}
            locale={locale}
            profileHref={`/${locale}/teachers/${featured.slug}`}
            labels={{ studyWith: t('studyWith', { name: firstName(featured) }), video: t('video') }}
          />
          {rest.length > 0 && <TeacherCards teachers={rest} locale={locale} />}
        </>
      )}
    </Container>
  )
}
