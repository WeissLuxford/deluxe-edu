import Link from 'next/link'
import { prisma } from '@/lib/db'
import { revokeEnrollment } from '@/features/admin/actions'
import { EnrollForm } from '@/features/admin/components/EnrollForm'
import { DeleteButton } from '@/features/admin/components/DeleteButton'

function ru(value: any) {
  if (!value) return '—'
  if (typeof value === 'string') return value
  return value.ru || Object.values(value)[0] || '—'
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
        <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
          Пользователи ({users.length})
        </h2>
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
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          {query ? 'Никого не нашлось.' : 'Пользователей пока нет.'}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Пользователь</th>
                <th style={{ textAlign: 'left' }}>Роль</th>
                <th style={{ textAlign: 'left' }}>Курсы</th>
                <th>Уроков пройдено</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ color: 'var(--fg)' }}>{u.name || 'без имени'}</div>
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
                  <td style={{ textAlign: 'center' }}>{u._count.LessonProgress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
