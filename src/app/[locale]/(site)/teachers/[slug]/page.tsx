import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getTeacher, teacherSlugs, pickText } from '@/features/teachers/registry'
import { personJsonLd } from '@/features/seo/jsonLd'

export function generateStaticParams() {
  return teacherSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const teacher = getTeacher(slug)
  if (!teacher) return {}

  return {
    title: `${teacher.name} — ${pickText(teacher.role, locale)} — Highgate`,
    description: pickText(teacher.bio, locale)
  }
}

export default async function TeacherProfilePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'teachers' })

  const teacher = getTeacher(slug)
  if (!teacher) notFound()

  const role = pickText(teacher.role, locale)

  return (
    <main className="doc-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(teacher, locale))
        }}
      />

      <article className="doc">
        <Link href={`/${locale}/teachers`} className="doc-brand">
          ← {t('back')}
        </Link>

        <div className="teacher-profile">
          {teacher.photo ? (
            <Image
              src={teacher.photo}
              alt={teacher.name}
              width={220}
              height={220}
              className="teacher-profile__photo"
              priority
            />
          ) : (
            <div className="teacher-profile__photo teacher-card__initial" aria-hidden="true">
              {teacher.name.slice(0, 1)}
            </div>
          )}

          <div>
            <h1 className="doc-title" style={{ marginTop: 0 }}>{teacher.name}</h1>
            <p className="doc-sub">{role}</p>

            {teacher.credentials.length > 0 && (
              <section className="doc-section">
                <h2 className="doc-section__title">{t('credentials')}</h2>
                <ul className="teacher-card__creds">
                  {teacher.credentials.map(cred => (
                    <li key={cred}>{cred}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        <section className="doc-section">
          <p style={{ margin: 0, lineHeight: 1.65 }}>{pickText(teacher.bio, locale)}</p>
        </section>

        {teacher.videoUrl && (
          <section className="doc-section">
            <h2 className="doc-section__title">{t('watch')}</h2>
            <a className="btn btn-ghost" href={teacher.videoUrl} target="_blank" rel="noreferrer">
              {t('watch')}
            </a>
          </section>
        )}
      </article>
    </main>
  )
}
