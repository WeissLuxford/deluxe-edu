import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { requireAdmin } from '@/features/admin/requireAdmin'

function contact(user: { phone: string | null; email: string | null }) {
  if (user.phone) return `+${user.phone}`
  return user.email || 'без контакта'
}

export default async function AdminTeachers({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireAdmin(locale)

  const teachers = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { groups: true } },
      groups: { select: { _count: { select: { members: { where: { leftAt: null } } } } } }
    }
  })

  return (
    <div className="space-y-4">
      <AdminPageHead title="Учителя" subtitle={`Всего ${teachers.length}`} />

      {teachers.length === 0 ? (
        <div className="admin-empty">
          Учителей пока нет. Назначить роль «Преподаватель» можно на странице студента.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Учитель</th>
                <th className="num">Групп</th>
                <th className="num">Студентов</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => {
                const students = t.groups.reduce((sum, g) => sum + g._count.members, 0)
                return (
                  <tr key={t.id}>
                    <td>
                      <span style={{ color: 'var(--fg)' }}>{t.name || 'без имени'}</span>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{contact(t)}</div>
                    </td>
                    <td className="num">{t._count.groups}</td>
                    <td className="num">{students}</td>
                    <td className="right">
                      <Link
                        href={`/${locale}/admin/teachers/${t.id}`}
                        className="row-icon-btn"
                        title="Группы учителя"
                      >
                        Группы
                      </Link>
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
