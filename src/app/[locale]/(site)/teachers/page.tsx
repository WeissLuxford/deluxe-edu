import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/design/components/Button'
import { Chip } from '@/design/components/Bits'
import { Reveal } from '@/design/components/Reveal'
import { Container, Heading } from '@/design/components/Type'
import { LEVEL_CODES, levelVars } from '@/design/levels'
import { personJsonLd } from '@/features/seo/jsonLd'
import { pickText, publishedTeachers, type Teacher } from '@/features/teachers/registry'
import s from '@/features/site/info.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'teachersPage.meta' })
  return { title: t('title'), description: t('description') }
}

function Portrait({ teacher, className, bg }: { teacher: Teacher; className: string; bg: string }) {
  return (
    <span className={className} style={{ background: bg }}>
      {teacher.photo ? (
        <Image src={teacher.photo} alt={teacher.name} width={420} height={460} className={s.portraitImg} />
      ) : (
        <span className={s.portraitInitial} aria-hidden="true">{teacher.name.slice(0, 1)}</span>
      )}
    </span>
  )
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
          <Reveal className={s.featured}>
            <Portrait teacher={featured} className={s.portrait} bg="var(--lv-b2-bg)" />
            <div className={s.featuredBody}>
              {featured.credentials.length > 0 && (
                <span className={s.chips}>
                  {featured.credentials.map(c => (
                    <Chip key={c}>{c}</Chip>
                  ))}
                </span>
              )}
              <span className={s.featuredName}>{featured.name}</span>
              <p className={s.quote}>
                <span className="it">«</span>
                {pickText(featured.bio, locale)}
                <span className="it">»</span>
              </p>
              <span className={s.teacherCardRole}>{pickText(featured.role, locale)}</span>
            </div>
          </Reveal>

          {rest.length > 0 && (
            <div className={s.teacherGrid}>
              {rest.map((teacher, i) => (
                <Reveal key={teacher.slug} delay={i * 80} className={s.teacherCard}>
                  <Portrait teacher={teacher} className={s.teacherCardPhoto} bg={levelVars(LEVEL_CODES[i % LEVEL_CODES.length]).bg} />
                  <span className={s.teacherCardBody}>
                    <span className={s.teacherCardName}>{teacher.name}</span>
                    <span className={s.teacherCardRole}>{pickText(teacher.role, locale)}</span>
                  </span>
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  )
}
