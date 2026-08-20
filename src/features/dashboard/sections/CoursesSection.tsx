import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CourseTile } from '@/features/learn/components/CourseTile'
import type { CourseTree } from '@/features/learn/progress'

export async function CoursesSection({ trees, locale }: { trees: CourseTree[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  if (!trees.length) {
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

  return (
    <div className="learn-grid">
      {trees.map(tree => (
        <CourseTile key={tree.courseId} locale={locale} tree={tree} />
      ))}
    </div>
  )
}
