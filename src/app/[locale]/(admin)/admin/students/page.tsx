import Link from 'next/link'
import { prisma } from '@/lib/db'
import { revokeEnrollment } from '@/features/admin/actions'
import { EnrollForm } from '@/features/admin/components/EnrollForm'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { localized } from '@/lib/localized'

function ru(value: unknown) {
  return localized(value, 'ru') || '—'
}

export default async function AdminStudents({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale } = await params
  const { q = '' } = await searchParams
  const query = q.trim()

  const where = query
    ? {
        OR: [
          { phone: { contains: query } },
          { name: { contains: query, mode: 'insensitive' as const } },
          { firstName: { contains: query, mode: 'insensitive' as const } },
          { lastName: { contains: query, mode: 'insensitive' as const } }
        ]
      }
    : {}

  const [users, allUsers, courses] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        enrollments: { include: { course: { select: { title: true, slug: true } } } },
        _count: { select: { LessonProgress: true } }
      }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: { id: true, name: true, phone: true }
    }),
    prisma.course.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, title: true } })
  ])

  return (
    <div className="space-y-6">
      <EnrollForm
        users={allUsers.map(u => ({ id: u.id, label: `${u.name || 'без имени'} · +${u.phone}` }))}
        courses={courses.map(c => ({ id: c.id, label: ru(c.title) }))}
      />

      <div className="flex items-center justify-between">
        <h2 className="admin-page-head__title">Пользователи ({users.length})</h2>
        <form method="get" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={query}
            className="input"
            placeholder="Телефон или имя"
            style={{ minWidth: '14rem' }}
          />
          <button type="submit" className="btn btn-secondary">Найти</button>
          {query && (
            <Link href={`/${locale}/admin/students`} className="btn btn-ghost">Сброс</Link>
          )}
        </form>
      </div>

      {users.length === 0 ? (
        <div className="admin-empty">{query ? 'Никого не нашлось.' : 'Пользователей пока нет.'}</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Курсы</th>
                <th>Уроков пройдено</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <Link
                      href={`/${locale}/admin/students/${u.id}`}
                      style={{ color: 'var(--brand-text)', fontWeight: 600 }}
                    >
                      {u.name || 'без имени'}
                    </Link>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>+{u.phone}</div>
                  </td>
                  <td>
                    <span className={u.role === 'ADMIN' ? 'badge badge-primary' : 'badge'}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.enrollments.length === 0 ? (
                      <span style={{ color: 'var(--muted)' }}>—</span>
                    ) : (
                      <div className="space-y-1">
                        {u.enrollments.map(e => (
                          <div key={e.id} className="flex items-center gap-2">
                            <span style={{ color: 'var(--fg)', fontSize: '0.9rem' }}>
                              {ru(e.course.title)}
                            </span>
                            <span className="badge">{e.plan || 'BASIC'}</span>
                            {e.status === 'ACTIVE' ? (
                              <DeleteButton
                                action={revokeEnrollment.bind(null, e.id)}
                                confirmText={`Отозвать доступ к курсу «${ru(e.course.title)}»? Прогресс сохранится.`}
                                label="Отозвать"
                              />
                            ) : (
                              <span className="badge badge-warning">отозван</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="num">{u._count.LessonProgress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
