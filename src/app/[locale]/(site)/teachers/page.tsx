import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { publishedTeachers, pickText } from '@/features/teachers/registry'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'teachers' })
  return { title: `${t('title')} — Highgate`, description: t('lead') }
}

export default async function TeachersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'teachers' })
  const teachers = publishedTeachers()

  return (
    <main className="doc-page">
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <h1 className="doc-title">{t('title')}</h1>
        <p className="doc-sub" style={{ marginBottom: '2rem' }}>{t('lead')}</p>

        {teachers.length === 0 ? (
          <p className="doc-empty">{t('empty')}</p>
        ) : (
          <div className="teacher-grid">
            {teachers.map(teacher => (
              <Link key={teacher.slug} href={`/${locale}/teachers/${teacher.slug}`} className="teacher-card">
                {teacher.photo ? (
                  <Image
                    src={teacher.photo}
                    alt={teacher.name}
                    width={200}
                    height={200}
                    className="teacher-card__photo"
                  />
                ) : (
                  <div className="teacher-card__photo teacher-card__initial" aria-hidden="true">
                    {teacher.name.slice(0, 1)}
                  </div>
                )}

                <div>
                  <strong className="teacher-card__name">{teacher.name}</strong>
                  <div className="teacher-card__role">{pickText(teacher.role, locale)}</div>
                  {teacher.credentials.length > 0 && (
                    <ul className="teacher-card__creds">
                      {teacher.credentials.map(cred => (
                        <li key={cred}>{cred}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
