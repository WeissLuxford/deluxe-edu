import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { prisma } from '@/lib/db'
import { createModule } from '@/features/admin/moduleActions'
import { CourseStructure } from '@/features/admin/components/CourseStructure'
import { ModuleForm } from '@/features/admin/components/ModuleForm'
import { localized } from '@/lib/localized'

function ru(value: unknown) {
  return localized(value, 'ru') || '—'
}

export default async function EditCourse({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const lessonSelect = {
    id: true,
    slug: true,
    title: true,
    order: true,
    hasVideo: true,
    hasConspect: true,
    hasTest: true,
    videoUrl: true,
    durationMin: true,
    moduleId: true,
    _count: { select: { Assignment: true } }
  } as const

  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' }, select: lessonSelect } }
      },
      lessons: { where: { moduleId: null }, orderBy: { order: 'asc' }, select: lessonSelect }
    }
  })

  if (!course) notFound()

  const lessonCount =
    course.modules.reduce((sum, m) => sum + m.lessons.length, 0) + course.lessons.length

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/courses`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку курсов
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
          {ru(course.title)}
        </h2>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/admin/courses/${id}/settings`} className="btn btn-secondary">
            <Pencil size={15} /> Карточка курса
          </Link>
          <Link
            href={`/${locale}/courses/${course.slug}`}
            className="btn btn-secondary"
            target="_blank"
          >
            Посмотреть на сайте
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
            Программа: {course.modules.length} модуль(ей), {lessonCount} урок(ов)
          </h3>
        </div>

        {course.modules.length === 0 && course.lessons.length === 0 ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0' }}>
            В курсе пока нет ни модулей, ни уроков. Начните с модуля — это раздел программы,
            внутри которого лежат уроки.
          </div>
        ) : (
          <CourseStructure
            locale={locale}
            courseId={id}
            modules={course.modules}
            orphans={course.lessons}
          />
        )}
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
          Новый модуль
        </h3>
        <ModuleForm action={createModule.bind(null, id)} submitLabel="Создать модуль" />
      </div>
    </div>
  )
}
