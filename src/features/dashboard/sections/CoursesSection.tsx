import { useTranslations, useLocale } from 'next-intl'

type Enrollment = {
  id: string
  status: string
  course: { id: string; slug: string; title: any }
}

export default function CoursesSection({ enrollments }: { enrollments: Enrollment[] }) {
  const t = useTranslations('common')
  const locale = useLocale()

  if (!enrollments?.length) {
    return (
      <section className="card">
        <div className="text-sm text-muted">{t('dashboard.noEnrollments')}</div>
      </section>
    )
  }

  return (
    <section className="card">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrollments.map(e => {
          const title =
            (e.course.title && typeof e.course.title === 'object'
              ? e.course.title[locale] || e.course.title.ru || e.course.title.en
              : e.course.title) || e.course.slug
          return (
            <div key={e.id} className="p-4 rounded border" style={{ borderColor: 'var(--border)' }}>
              <div className="font-medium">{title}</div>
              <div className="text-sm text-muted mt-1">{t('dashboard.status')}: {e.status}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
