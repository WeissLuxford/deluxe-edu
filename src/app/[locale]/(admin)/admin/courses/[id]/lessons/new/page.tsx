import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createLesson } from '@/features/admin/actions'
import { LessonForm } from '@/features/admin/components/LessonForm'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'
import { localized } from '@/lib/localized'

export default async function NewLesson({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ module?: string }>
}) {
  const { locale, id } = await params
  const { module: moduleParam } = await searchParams

  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      modules: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } }
    }
  })
  if (!course) notFound()

  const targetModule =
    course.modules.find(m => m.id === moduleParam)?.id ?? course.modules[0]?.id ?? null

  const last = await prisma.lesson.findFirst({
    where: { courseId: id, moduleId: targetModule },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  return (
    <div className="space-y-4">
      <Link
        href={`/${locale}/admin/courses/${id}`}
        className="text-sm"
        style={{ color: 'var(--muted)' }}
      >
        ← К курсу
      </Link>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
        Новый урок
      </h2>

      <LocaleTabsProvider>
        <LessonForm
          action={createLesson.bind(null, id)}
          modules={course.modules.map(m => ({
            id: m.id,
            label: `${m.order + 1}. ${localized(m.title, 'ru') || 'без названия'}`
          }))}
          lesson={{
            slug: '',
            title: {},
            content: {},
            order: (last?.order ?? -1) + 1,
            hasVideo: true,
            hasConspect: true,
            hasTest: false,
            videoUrl: null,
            zoomMeetingId: null,
            moduleId: targetModule,
            coverUrl: null,
            durationMin: null
          }}
          submitLabel="Создать урок"
          redirectTo={`/${locale}/admin/courses/${id}`}
        />
      </LocaleTabsProvider>
    </div>
  )
}
