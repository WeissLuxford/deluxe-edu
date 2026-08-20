import Link from 'next/link'
import { History } from 'lucide-react'
import { prisma } from '@/lib/db'
import { revokeEnrollment, deleteUser } from '@/features/admin/actions'
import { EnrollForm } from '@/features/admin/components/EnrollForm'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { RoleSelect } from '@/features/admin/components/RoleSelect'
import { requireAdmin } from '@/features/admin/requireAdmin'
import { localized } from '@/lib/localized'

// Телефона может не быть: аккаунт заводят и по почте, и через Google.
function contact(user: { phone: string | null; email: string | null }) {
  if (user.phone) return `+${user.phone}`
  return user.email || 'без контакта'
}

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
  const admin = await requireAdmin(locale)

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
      select: { id: true, name: true, phone: true, email: true }
    }),
    prisma.course.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, title: true } })
  ])

  return (
    <div className="space-y-6">
      <EnrollForm
        users={allUsers.map(u => ({ id: u.id, label: `${u.name || 'без имени'} · ${contact(u)}` }))}
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
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const activeEnrollments = u.enrollments.filter(e => e.status === 'ACTIVE')
                const archivedCount = u.enrollments.length - activeEnrollments.length

                return (
                  <tr key={u.id}>
                    <td>
                      <Link
                        href={`/${locale}/admin/students/${u.id}`}
                        style={{ color: 'var(--brand-text)', fontWeight: 600 }}
                      >
                        {u.name || 'без имени'}
                      </Link>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{contact(u)}</div>
                    </td>
                    <td>
                      <RoleSelect
                        userId={u.id}
                        role={u.role}
                        name={u.name || u.phone || 'без имени'}
                        self={u.id === admin.id}
                      />
                    </td>
                    <td>
                      {activeEnrollments.length === 0 ? (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      ) : (
                        <div className="space-y-1">
                          {activeEnrollments.map(e => (
                            <div key={e.id} className="flex items-center gap-2">
                              <span style={{ color: 'var(--fg)', fontSize: '0.9rem' }}>
                                {ru(e.course.title)}
                              </span>
                              <span className="badge">{e.plan || 'BASIC'}</span>
                              <DeleteButton
                                action={revokeEnrollment.bind(null, e.id)}
                                confirmText={`Отозвать доступ к курсу «${ru(e.course.title)}»? Прогресс сохранится.`}
                                label="Отозвать"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {archivedCount > 0 && (
                        <Link
                          href={`/${locale}/admin/students/${u.id}/history`}
                          className="text-xs"
                          style={{ color: 'var(--muted)' }}
                        >
                          + {archivedCount} в архиве
                        </Link>
                      )}
                    </td>
                    <td className="num">{u._count.LessonProgress}</td>
                    <td className="right">
                      <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }}>
                        <Link
                          href={`/${locale}/admin/students/${u.id}/history`}
                          className="row-icon-btn"
                          title="Журнал: курсы, платежи, тесты"
                        >
                          <History size={14} />
                        </Link>
                        {(u.role === 'STUDENT' || u.role === 'MENTOR') && u.id !== admin.id && (
                          <DeleteButton
                            action={deleteUser.bind(null, u.id)}
                            confirmText={`Удалить пользователя «${u.name || 'без имени'}»? Это удалит его записи на курсы, платежи и прогресс без возможности восстановления.`}
                            label="Удалить"
                            variant="icon"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
