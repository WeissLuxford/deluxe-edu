import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { TeacherPageHead } from '@/features/teacher/components/TeacherPageHead'

const TYPE_LABELS: Record<string, string> = {
  LESSON: 'Урок',
  MOCK_TEST: 'Мок-тест',
  EXAM: 'Контрольная',
  SPEAKING_PRACTICE: 'Спикинг',
  OTHER: 'Другое'
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

export default async function TeacherOverview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const teacher = await requireTeacher(locale)
  const now = new Date()
  const base = `/${locale}/teacher`

  const [groupsCount, studentsCount, lessonsConducted, testsConducted, upcoming] = await Promise.all([
    prisma.group.count({ where: { teacherId: teacher.id, archived: false } }),
    prisma.groupMembership.count({ where: { group: { teacherId: teacher.id }, leftAt: null } }),
    prisma.scheduleEvent.count({
      where: { group: { teacherId: teacher.id }, type: 'LESSON', startsAt: { lt: now } }
    }),
    prisma.scheduleEvent.count({
      where: {
        group: { teacherId: teacher.id },
        type: { in: ['MOCK_TEST', 'EXAM'] },
        startsAt: { lt: now }
      }
    }),
    prisma.scheduleEvent.findMany({
      where: { group: { teacherId: teacher.id }, startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 8,
      include: { group: { select: { id: true, name: true } } }
    })
  ])

  return (
    <div className="space-y-6">
      <TeacherPageHead title="Обзор" subtitle={`Здравствуйте, ${teacher.name || 'Учитель'}`} />

      <div className="admin-stats">
        <Link href={`${base}/groups`} className="admin-stat">
          <span className="admin-stat__label">Групп</span>
          <span className="admin-stat__value">{groupsCount}</span>
          <span className="admin-stat__hint">активных</span>
        </Link>
        <Link href={`${base}/groups`} className="admin-stat">
          <span className="admin-stat__label">Студентов</span>
          <span className="admin-stat__value">{studentsCount}</span>
          <span className="admin-stat__hint">на всех группах</span>
        </Link>
        <div className="admin-stat">
          <span className="admin-stat__label">Уроков проведено</span>
          <span className="admin-stat__value">{lessonsConducted}</span>
          <span className="admin-stat__hint">за всё время</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">Тестов/контрольных</span>
          <span className="admin-stat__value">{testsConducted}</span>
          <span className="admin-stat__hint">проведено</span>
        </div>
      </div>

      <section className="admin-card">
        <h3 className="admin-card__title">Ближайшие занятия</h3>
        {upcoming.length === 0 ? (
          <p className="admin-empty">Ничего не запланировано.</p>
        ) : (
          <ul className="admin-feed">
            {upcoming.map(e => (
              <li key={e.id}>
                <Link href={`${base}/groups/${e.group.id}/schedule/${e.id}`}>
                  <strong>{e.title || TYPE_LABELS[e.type]}</strong>
                  <span>
                    {e.group.name} · {TYPE_LABELS[e.type]}
                  </span>
                </Link>
                <time>{dateFmt.format(e.startsAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
