import Link from 'next/link'
import { createCourse } from '@/features/admin/actions'
import { CourseForm } from '@/features/admin/components/CourseForm'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'
import { requireAdmin } from '@/features/admin/requireAdmin'

export default async function NewCourse({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireAdmin(locale)

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/admin/courses`} className="admin-page-head__back">
        ← К списку курсов
      </Link>

      <h1 className="admin-page-head__title">Новый курс</h1>

      <LocaleTabsProvider>
        <CourseForm
          action={createCourse}
          submitLabel="Создать курс"
          redirectTo={`/${locale}/admin/courses`}
        />
      </LocaleTabsProvider>
    </div>
  )
}
