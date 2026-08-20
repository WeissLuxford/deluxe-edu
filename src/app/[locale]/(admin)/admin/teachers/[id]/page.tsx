import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { requireAdmin } from '@/features/admin/requireAdmin'

export default async function AdminTeacherDetail({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  await requireAdmin(locale)

  const teacher = await prisma.user.findFirst({
    where: { id, role: 'MENTOR' },
    include: {
      groups: {
        orderBy: [{ archived: 'asc' }, { createdAt: 'desc' }],
        include: { _count: { select: { members: { where: { leftAt: null } } } } }
      }
    }
  })
  if (!teacher) notFound()

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/admin/teachers`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку учителей
      </Link>

      <AdminPageHead title={teacher.name || 'Учитель'} subtitle={`Групп: ${teacher.groups.length}`} />

      {teacher.groups.length === 0 ? (
        <div className="admin-empty">У этого учителя пока нет групп.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))'
          }}
        >
          {teacher.groups.map(g => (
            <Link
              key={g.id}
              href={`/${locale}/admin/teachers/${id}/groups/${g.id}`}
              className="admin-card"
              style={{ display: 'block' }}
            >
              <h3 className="admin-card__title" style={{ marginBottom: '0.25rem' }}>
                {g.name}
              </h3>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {g._count.members} студентов
              </div>
              {g.archived && (
                <span className="badge" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                  архив
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
