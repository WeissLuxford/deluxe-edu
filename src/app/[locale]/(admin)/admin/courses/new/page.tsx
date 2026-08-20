import Link from 'next/link'
import { createCourse } from '@/features/admin/actions'
import { CourseForm } from '@/features/admin/components/CourseForm'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'

export default async function NewCourse({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/admin/courses`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку курсов
      </Link>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>Новый курс</h2>

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
