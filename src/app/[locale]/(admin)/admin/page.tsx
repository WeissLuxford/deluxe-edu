import Link from 'next/link'
import { AlertTriangle, Inbox, UserPlus, Radio, Plus } from 'lucide-react'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

const ru = (value: unknown) => localized(value, 'ru') || '—'

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const base = `/${locale}/admin`

  const [
    courses,
    published,
    lessons,
    assignments,
    users,
    enrollments,
    newContacts,
    latestContacts,
    latestUsers,
    upcomingStreams,
    publishedNoLessons,
    emptyModules,
    testsWithoutKey,
    orphanLessons
  ] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { published: true } }),
    prisma.lesson.count(),
    prisma.assignment.count(),
    prisma.user.count(),
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.contactRequest.count({ where: { status: 'NEW' } }),
    prisma.contactRequest.findMany({
      where: { status: 'NEW' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, firstName: true, lastName: true, phone: true, createdAt: true }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, firstName: true, phone: true, createdAt: true }
    }),
    prisma.stream.findMany({
      where: { published: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      take: 3,
      select: { id: true, title: true, startsAt: true }
    }),
    prisma.course.findMany({
      where: { published: true, lessons: { none: {} } },
      select: { id: true, title: true }
    }),
    prisma.module.findMany({
      where: { lessons: { none: {} } },
      select: { id: true, title: true, courseId: true }
    }),
    prisma.assignment.findMany({
      where: { answerKey: { equals: Prisma.DbNull } },
      select: { id: true, lessonId: true, title: true }
    }),
    prisma.lesson.count({ where: { moduleId: null } })
  ])

  const stats = [
    { label: 'Курсов', value: courses, hint: `${published} опубликовано`, href: `${base}/courses` },
    { label: 'Уроков', value: lessons, hint: `${assignments} с тестом`, href: `${base}/courses` },
    { label: 'Пользователей', value: users, hint: `${enrollments} активных записей`, href: `${base}/students` },
    { label: 'Новых заявок', value: newContacts, hint: 'с формы на сайте', href: `${base}/contacts` }
  ]

  const warnings = [
    ...publishedNoLessons.map(c => ({
      key: `course-${c.id}`,
      text: `Курс «${ru(c.title)}» опубликован, но в нём нет уроков`,
      href: `${base}/courses/${c.id}`
    })),
    ...emptyModules.map(m => ({
      key: `module-${m.id}`,
      text: `Модуль «${ru(m.title)}» пустой — студенту он не показывается`,
      href: `${base}/courses/${m.courseId}`
    })),
    ...testsWithoutKey.map(a => ({
      key: `assignment-${a.id}`,
      text: `У теста «${ru(a.title)}» нет правильных ответов — сервер не сможет его проверить`,
      href: `${base}/lessons/${a.lessonId}`
    })),
    ...(orphanLessons > 0
      ? [
          {
            key: 'orphans',
            text: `${orphanLessons} урок(ов) не привязаны к модулю`,
            href: `${base}/courses`
          }
        ]
      : [])
  ]

  return (
    <div className="space-y-6">
      <div className="admin-stats">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="admin-stat">
            <span className="admin-stat__label">{s.label}</span>
            <span className="admin-stat__value">{s.value}</span>
            <span className="admin-stat__hint">{s.hint}</span>
          </Link>
        ))}
      </div>

      <div className="admin-quick">
        <Link href={`${base}/courses/new`} className="btn btn-primary btn-sm">
          <Plus size={15} /> Курс
        </Link>
        <Link href={`${base}/streams/new`} className="btn btn-secondary btn-sm">
          <Plus size={15} /> Эфир
        </Link>
        <Link href={`${base}/news/new`} className="btn btn-secondary btn-sm">
          <Plus size={15} /> Новость
        </Link>
      </div>

      {courses === 0 && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)', marginBottom: '0.5rem' }}>
            В базе пока нет ни одного курса
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>
            Пока курсов нет, на сайте нечего показывать и не за что платить.
          </p>
          <Link href={`${base}/courses/new`} className="btn btn-primary">
            Создать курс
          </Link>
        </div>
      )}

      {warnings.length > 0 && (
        <section className="admin-card">
          <h3 className="admin-card__title">
            <AlertTriangle size={16} /> Требует внимания ({warnings.length})
          </h3>
          <ul className="admin-warnings">
            {warnings.map(w => (
              <li key={w.key}>
                <Link href={w.href}>{w.text}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="admin-columns">
        <section className="admin-card">
          <h3 className="admin-card__title">
            <Inbox size={16} /> Свежие заявки
          </h3>
          {latestContacts.length === 0 ? (
            <p className="admin-empty">Новых заявок нет.</p>
          ) : (
            <ul className="admin-feed">
              {latestContacts.map(c => (
                <li key={c.id}>
                  <Link href={`${base}/contacts`}>
                    <strong>
                      {c.firstName} {c.lastName}
                    </strong>
                    <span>+{c.phone}</span>
                  </Link>
                  <time>{dateFmt.format(c.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card">
          <h3 className="admin-card__title">
            <UserPlus size={16} /> Последние регистрации
          </h3>
          {latestUsers.length === 0 ? (
            <p className="admin-empty">Пользователей пока нет.</p>
          ) : (
            <ul className="admin-feed">
              {latestUsers.map(u => (
                <li key={u.id}>
                  <Link href={`${base}/students/${u.id}`}>
                    <strong>{u.firstName || u.name || 'без имени'}</strong>
                    <span>+{u.phone}</span>
                  </Link>
                  <time>{dateFmt.format(u.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card">
          <h3 className="admin-card__title">
            <Radio size={16} /> Ближайшие эфиры
          </h3>
          {upcomingStreams.length === 0 ? (
            <p className="admin-empty">Запланированных эфиров нет.</p>
          ) : (
            <ul className="admin-feed">
              {upcomingStreams.map(s => (
                <li key={s.id}>
                  <Link href={`${base}/streams/${s.id}`}>
                    <strong>{ru(s.title)}</strong>
                  </Link>
                  <time>{dateFmt.format(s.startsAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
