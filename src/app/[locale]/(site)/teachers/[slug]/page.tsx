import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Container } from '@/design/components/Type'
import { getTeacher, pickText, publishedTeachers, teacherSlugs } from '@/features/teachers/registry'
import { FeaturedTeacher, TeacherCards, firstName } from '@/features/teachers/TeacherBits'
import { personJsonLd } from '@/features/seo/jsonLd'
import s from '@/features/site/info.module.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return teacherSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const teacher = getTeacher(slug)
  if (!teacher) return {}
  return {
    title: `${teacher.name} — ${pickText(teacher.role, locale)} — Highgate`,
    description: pickText(teacher.bio, locale)
  }
}

export default async function TeacherProfilePage({ params }: Props) {
  const { locale, slug } = await params
  const teacher = getTeacher(slug)
  if (!teacher) notFound()

  const t = await getTranslations({ locale, namespace: 'teachersPage' })
  const others = publishedTeachers().filter(other => other.slug !== teacher.slug)

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(teacher, locale)) }} />

      <Link href={`/${locale}/teachers`} className={s.profileBack}>
        ← {t('back')}
      </Link>

      <FeaturedTeacher teacher={teacher} locale={locale} asHeading labels={{ studyWith: t('studyWith', { name: firstName(teacher) }), video: t('video') }} />

      {others.length > 0 && (
        <>
          <h2 className={s.othersTitle}>{t('others')}</h2>
          <TeacherCards teachers={others} locale={locale} />
        </>
      )}
    </Container>
  )
}
