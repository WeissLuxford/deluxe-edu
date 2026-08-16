import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const [courses, published, lessons, assignments, users, enrollments, newContacts] =
    await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.lesson.count(),
      prisma.assignment.count(),
      prisma.user.count(),
      prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      prisma.contactRequest.count({ where: { status: 'NEW' } })
    ])

  const stats = [
    { label: 'Курсов', value: courses, hint: `${published} опубликовано` },
    { label: 'Уроков', value: lessons, hint: `${assignments} с тестом` },
    { label: 'Пользователей', value: users, hint: `${enrollments} активных записей` },
    { label: 'Новых заявок', value: newContacts, hint: 'с формы на сайте' }
  ]

  return (
    <div className="space-y-6">
      <div className="access-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>{s.label}</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--gold-text)', margin: '0.25rem 0' }}>
              {s.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{s.hint}</div>
          </div>
        ))}
      </div>

      {courses === 0 && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="text-4xl" style={{ marginBottom: '0.75rem' }}>📚</div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)', marginBottom: '0.5rem' }}>
            В базе пока нет ни одного курса
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>
            Пока курсов нет, на сайте нечего показывать и не за что платить.
            Начните с первого — уроки и тесты можно добавить внутрь позже.
          </p>
          <Link href={`/${locale}/admin/courses/new`} className="btn btn-primary">
            Создать курс
          </Link>
        </div>
      )}
    </div>
  )
}
