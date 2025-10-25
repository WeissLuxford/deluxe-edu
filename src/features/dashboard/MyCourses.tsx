import { useTranslations, useLocale } from 'next-intl'

export default function MyCourses({ enrollments }: { enrollments: any[] }) {
  const t = useTranslations('common')
  const locale = useLocale()

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('dashboard.myCourses')}</h3>
      {enrollments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">{t('dashboard.noEnrollments')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(enroll => {
            const title =
              (enroll.course?.title && typeof enroll.course.title === 'object'
                ? enroll.course.title[locale] || enroll.course.title.ru || enroll.course.title.en
                : enroll.course?.title) || enroll.course?.slug
            const status =
              enroll.status === 'ACTIVE' ? t('dashboard.statusActive') : t('dashboard.statusCancelled')
            return (
              <div key={enroll.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('dashboard.status')}: {status}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
