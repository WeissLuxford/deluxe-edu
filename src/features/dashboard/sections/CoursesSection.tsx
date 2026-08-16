'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { CourseArticle } from '@/features/courses/components/CourseArticle'
import type { DashboardCourse } from '../DashboardShell'

function localized(value: any, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value[locale]) return value[locale]
    const first = Object.values(value)[0]
    return typeof first === 'string' ? first : ''
  }
  return ''
}

export default function CoursesSection({
  courses,
  locale
}: {
  courses: DashboardCourse[]
  locale: string
}) {
  const t = useTranslations('dashboard')

  if (!courses.length) {
    return (
      <div className="empty-state">
        <h3>{t('noEnrollments')}</h3>
        <p>{t('noEnrollmentsHint')}</p>
        <Link href={`/${locale}/courses`} className="btn btn-primary">
          {t('browseCourses')}
        </Link>
      </div>
    )
  }

  // Те же карточки, что в каталоге: одна и та же вещь должна выглядеть
  // одинаково в обоих местах, иначе кабинет ощущается другим сайтом
  return (
    <div className="course-grid">
      {courses.map(c => (
        <CourseArticle
          key={c.enrollmentId}
          id={c.id}
          slug={c.slug}
          title={localized(c.title, locale) || c.slug}
          description={localized(c.description, locale)}
          level={c.level}
          lessonsCount={c.total}
          lessonsDone={c.done}
          priceBasic={c.priceBasic}
          pricePro={c.pricePro}
          priceDeluxe={c.priceDeluxe}
          locale={locale}
          state={c.completed ? 'completed' : 'enrolled'}
          resumeLessonSlug={c.resumeSlug ?? undefined}
        />
      ))}
    </div>
  )
}
