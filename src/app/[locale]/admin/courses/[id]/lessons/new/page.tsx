import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createLesson } from '@/features/admin/actions'
import { LessonForm } from '@/features/admin/components/LessonForm'

export default async function NewLesson({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, lessons: { select: { order: true }, orderBy: { order: 'desc' }, take: 1 } }
  })
  if (!course) notFound()

  const nextOrder = (course.lessons[0]?.order ?? -1) + 1

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/admin/courses/${id}`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К курсу
      </Link>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>Новый урок</h2>

      <LessonForm
        action={createLesson.bind(null, id)}
        lesson={{
          slug: '',
          title: {},
          content: {},
          order: nextOrder,
          hasVideo: true,
          hasConspect: true,
          hasTest: false,
          zoomMeetingId: null
        }}
        submitLabel="Создать урок"
        redirectTo={`/${locale}/admin/courses/${id}`}
      />
    </div>
  )
}
