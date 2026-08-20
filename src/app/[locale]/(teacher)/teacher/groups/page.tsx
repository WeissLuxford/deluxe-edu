import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { TeacherPageHead } from '@/features/teacher/components/TeacherPageHead'

export default async function TeacherGroups({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const teacher = await requireTeacher(locale)

  const groups = await prisma.group.findMany({
    where: { teacherId: teacher.id },
    orderBy: [{ archived: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: { select: { members: { where: { leftAt: null } } } }
    }
  })

  return (
    <div className="space-y-4">
      <TeacherPageHead
        title="Группы"
        subtitle={`Всего ${groups.length}`}
        action={
          <Link href={`/${locale}/teacher/groups/new`} className="btn btn-primary">
            Новая группа
          </Link>
        }
      />

      {groups.length === 0 ? (
        <div className="admin-empty">Групп пока нет.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))'
          }}
        >
          {groups.map(g => (
            <Link
              key={g.id}
              href={`/${locale}/teacher/groups/${g.id}`}
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
