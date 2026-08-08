import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateCourse, deleteLesson } from '@/features/admin/actions'
import { CourseForm } from '@/features/admin/components/CourseForm'
import { DeleteButton } from '@/features/admin/components/DeleteButton'

function ru(value: any) {
  if (!value) return '—'
  if (typeof value === 'string') return value
  return value.ru || Object.values(value)[0] || '—'
}

export default async function EditCourse({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { Assignment: true } } }
      }
    }
  })

  if (!course) notFound()

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/courses`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку курсов
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
          {ru(course.title)}
        </h2>
        <Link href={`/${locale}/courses/${course.slug}`} className="btn btn-secondary" target="_blank">
          Посмотреть на сайте
        </Link>
      </div>

      {/* Уроки */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
            Уроки ({course.lessons.length})
          </h3>
          <Link href={`/${locale}/admin/courses/${id}/lessons/new`} className="btn btn-primary">
            Добавить урок
          </Link>
        </div>

        {course.lessons.length === 0 ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0' }}>
            В курсе пока нет уроков.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '3rem' }}>#</th>
                  <th style={{ textAlign: 'left' }}>Урок</th>
                  <th>Шаги</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {course.lessons.map(l => (
                  <tr key={l.id}>
                    <td style={{ textAlign: 'center', color: 'var(--muted)' }}>{l.order}</td>
                    <td>
                      <Link href={`/${locale}/admin/lessons/${l.id}`} style={{ color: 'var(--gold)' }}>
                        {ru(l.title)}
                      </Link>
                      <div className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>
                        {l.slug}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {l.hasVideo && <span className="badge">видео</span>}{' '}
                      {l.hasConspect && <span className="badge">конспект</span>}{' '}
                      {l.hasTest && (
                        <span className={l._count.Assignment > 0 ? 'badge badge-success' : 'badge badge-warning'}>
                          {l._count.Assignment > 0 ? 'тест' : 'тест без вопросов'}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <DeleteButton
                        action={deleteLesson.bind(null, l.id)}
                        confirmText={`Удалить урок «${ru(l.title)}» вместе с тестом и прогрессом студентов?`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Настройки курса */}
      <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>Настройки курса</h3>
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
          visible: course.visible
        }}
        submitLabel="Сохранить"
        redirectTo={`/${locale}/admin/courses`}
      />
    </div>
  )
}
