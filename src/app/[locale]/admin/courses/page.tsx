import Link from 'next/link'
import { prisma } from '@/lib/db'
import { deleteCourse } from '@/features/admin/actions'
import { DeleteButton } from '@/features/admin/components/DeleteButton'

function ru(value: any) {
  if (!value) return '—'
  if (typeof value === 'string') return value
  return value.ru || Object.values(value)[0] || '—'
}

export default async function AdminCourses({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { lessons: true, Enrollment: true } }
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
          Курсы ({courses.length})
        </h2>
        <Link href={`/${locale}/admin/courses/new`} className="btn btn-primary">
          Новый курс
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          Курсов пока нет.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Название</th>
                <th style={{ textAlign: 'left' }}>Адрес</th>
                <th>Уроков</th>
                <th>Учеников</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/${locale}/admin/courses/${c.id}`} style={{ color: 'var(--gold)' }}>
                      {ru(c.title)}
                    </Link>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{c.level}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {c.slug}
                  </td>
                  <td style={{ textAlign: 'center' }}>{c._count.lessons}</td>
                  <td style={{ textAlign: 'center' }}>{c._count.Enrollment}</td>
                  <td style={{ textAlign: 'center' }}>
                    {c.published ? (
                      <span className="badge badge-success">опубликован</span>
                    ) : (
                      <span className="badge badge-warning">черновик</span>
                    )}
                    {!c.visible && <span className="badge" style={{ marginLeft: '0.25rem' }}>скрыт</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <DeleteButton
                      action={deleteCourse.bind(null, c.id)}
                      confirmText={`Удалить курс «${ru(c.title)}» вместе со всеми уроками и тестами? Это необратимо.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
