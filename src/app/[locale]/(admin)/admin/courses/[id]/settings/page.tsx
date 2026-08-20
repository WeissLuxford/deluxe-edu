import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateCourse } from '@/features/admin/actions'
import { CourseForm } from '@/features/admin/components/CourseForm'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'
import { localized } from '@/lib/localized'

function ru(value: unknown) {
  return localized(value, 'ru') || '—'
}

export default async function CourseSettings({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      slug: true,
      title: true,
      description: true,
      level: true,
      priceBasic: true,
      pricePro: true,
      priceDeluxe: true,
      published: true,
      visible: true,
      coverUrl: true,
      badge: true
    }
  })

  if (!course) notFound()

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/courses/${id}`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← Контент курса
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
          {ru(course.title)}: карточка курса
        </h2>
        <Link
          href={`/${locale}/courses/${course.slug}`}
          className="btn btn-secondary"
          target="_blank"
        >
          Посмотреть на сайте
        </Link>
      </div>

      <LocaleTabsProvider>
        <CourseForm
          action={updateCourse.bind(null, id)}
          course={{
            slug: course.slug,
            title: course.title as any,
            description: course.description as any,
            level: course.level,
            priceBasic: course.priceBasic,
            pricePro: course.pricePro,
            priceDeluxe: course.priceDeluxe,
            published: course.published,
            visible: course.visible,
            coverUrl: course.coverUrl,
            badge: course.badge
          }}
          submitLabel="Сохранить"
          redirectTo={`/${locale}/admin/courses`}
        />
      </LocaleTabsProvider>
    </div>
  )
}
