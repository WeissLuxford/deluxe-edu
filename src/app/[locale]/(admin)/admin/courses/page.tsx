import Link from 'next/link'
import { prisma } from '@/lib/db'
import { deleteCourse, toggleCoursePublished } from '@/features/admin/actions'
import { ActionButton } from '@/features/admin/components/ActionButton'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'

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
      <AdminPageHead
        title="Курсы"
        subtitle={`Всего ${courses.length}`}
        action={
          <Link href={`/${locale}/admin/courses/new`} className="btn btn-primary">
            Новый курс
          </Link>
        }
      />

      {courses.length === 0 ? (
        <div className="admin-empty">Курсов пока нет.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Адрес</th>
                <th className="num">Уроков</th>
                <th className="num">Учеников</th>
                <th className="num">Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/${locale}/admin/courses/${c.id}`} style={{ color: 'var(--gold-text)' }}>
                      {ru(c.title)}
                    </Link>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{c.level}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {c.slug}
                  </td>
                  <td className="num">{c._count.lessons}</td>
                  <td className="num">{c._count.Enrollment}</td>
                  <td className="num">
                    <ActionButton
                      action={toggleCoursePublished.bind(null, c.id)}
                      className={c.published ? 'badge badge-success toggle-badge' : 'badge badge-warning toggle-badge'}
                      title="Переключить публикацию"
                    >
                      {c.published ? 'опубликован' : 'черновик'}
                    </ActionButton>
                    {!c.visible && <span className="badge" style={{ marginLeft: '0.25rem' }}>скрыт</span>}
                  </td>
                  <td className="right">
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
