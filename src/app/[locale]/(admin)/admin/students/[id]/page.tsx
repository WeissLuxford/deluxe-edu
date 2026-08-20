import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Phone, Mail, CalendarDays, History, Smartphone } from 'lucide-react'
import { prisma } from '@/lib/db'
import { revokeEnrollment } from '@/features/admin/actions'
import { revokeDevice } from '@/features/admin/deviceActions'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { Avatar } from '@/features/ui/components/Avatar'
import { localized } from '@/lib/localized'
import { summarizeUserAgent } from '@/lib/userAgent'
import { DEVICE_LIMIT } from '@/lib/devices'

const ru = (value: unknown) => localized(value, 'ru') || '—'

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const dateTimeFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

export default async function StudentCard({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      enrollments: {
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              modules: {
                orderBy: { order: 'asc' },
                select: { id: true, title: true, lessons: { select: { id: true } } }
              },
              lessons: { select: { id: true } }
            }
          }
        }
      },
      LessonProgress: { select: { lessonId: true, passed: true } },
      submissions: {
        orderBy: { createdAt: 'desc' },
        include: { assignment: { select: { title: true, lessonId: true } } }
      },
      Payment: { orderBy: { createdAt: 'desc' }, include: { course: { select: { title: true } } } },
      devices: { orderBy: { lastSeenAt: 'desc' } }
    }
  })

  if (!user) notFound()

  const activeDevices = user.devices.filter(d => !d.revokedAt)
  const atDeviceLimit = activeDevices.length >= DEVICE_LIMIT

  const passed = new Set(user.LessonProgress.filter(p => p.passed).map(p => p.lessonId))
  const activeEnrollments = user.enrollments.filter(e => e.status === 'ACTIVE')
  const archivedCount = user.enrollments.length - activeEnrollments.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/admin/students`} className="text-sm" style={{ color: 'var(--muted)' }}>
          ← К списку студентов
        </Link>
        <Link
          href={`/${locale}/admin/students/${id}/history`}
          className="row-icon-btn"
          title="Журнал: курсы, платежи, тесты"
        >
          <History size={14} />
        </Link>
      </div>

      <div className="admin-card student-head">
        <Avatar name={user.name} seed={user.phone} image={user.image} size={64} />
        <div className="student-head__info">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
            {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || 'без имени'}
          </h2>
          <div className="student-head__meta">
            <span>
              <Phone size={14} /> +{user.phone}
              {user.phoneVerified && <CheckCircle2 size={13} className="student-ok" />}
            </span>
            {user.email && (
              <span>
                <Mail size={14} /> {user.email}
                {user.emailVerified && <CheckCircle2 size={13} className="student-ok" />}
              </span>
            )}
            <span>
              <CalendarDays size={14} /> с {dateFmt.format(user.createdAt)}
            </span>
            <span className="badge">{user.role}</span>
          </div>
        </div>
      </div>

      <section className="admin-card">
        <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
          <h3 className="admin-card__title" style={{ marginBottom: 0 }}>
            Курсы ({activeEnrollments.length})
          </h3>
          {archivedCount > 0 && (
            <Link
              href={`/${locale}/admin/students/${id}/history`}
              className="text-xs"
              style={{ color: 'var(--muted)' }}
            >
              + {archivedCount} в архиве (отозванные) — журнал
            </Link>
          )}
        </div>

        {activeEnrollments.length === 0 ? (
          <p className="admin-empty">Студент никуда не записан.</p>
        ) : (
          <div className="student-courses">
            {activeEnrollments.map(e => {
              const total = e.course.lessons.length
              const done = e.course.lessons.filter(l => passed.has(l.id)).length
              const percent = total > 0 ? Math.round((done / total) * 100) : 0

              return (
                <article key={e.id} className="student-course">
                  <header className="student-course__head">
                    <Link href={`/${locale}/admin/courses/${e.course.id}`}>
                      {ru(e.course.title)}
                    </Link>
                    <span className="badge badge-success">{e.plan || 'BASIC'}</span>
                    <DeleteButton
                      action={revokeEnrollment.bind(null, e.id)}
                      confirmText={`Отозвать доступ к курсу «${ru(e.course.title)}»? Прогресс сохранится.`}
                      label="Отозвать"
                    />
                  </header>

                  <div className="student-course__progress">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${percent}%` }} />
                    </div>
                    <span>
                      {done} из {total} уроков
                    </span>
                  </div>

                  <ul className="student-modules">
                    {e.course.modules.map(m => {
                      const mDone = m.lessons.filter(l => passed.has(l.id)).length
                      return (
                        <li key={m.id}>
                          <span>{ru(m.title)}</span>
                          <span className={mDone === m.lessons.length && m.lessons.length > 0 ? 'done' : ''}>
                            {mDone}/{m.lessons.length}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="admin-card">
        <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
          <h3 className="admin-card__title" style={{ marginBottom: 0 }}>
            Устройства ({activeDevices.length} активных из {DEVICE_LIMIT})
          </h3>
          {atDeviceLimit && (
            <span className="badge badge-warning" title="Похоже на доступ с нескольких устройств одновременно">
              лимит устройств достигнут
            </span>
          )}
        </div>

        {user.devices.length === 0 ? (
          <p className="admin-empty">Входов ещё не было.</p>
        ) : (
          <ul className="admin-feed">
            {user.devices.map(d => (
              <li key={d.id}>
                <span>
                  <strong>
                    <Smartphone size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem' }} />
                    {summarizeUserAgent(d.userAgent)}
                  </strong>
                  <span>
                    {d.ip ?? 'IP неизвестен'} · первый вход {dateTimeFmt.format(d.firstSeenAt)} · активность{' '}
                    {dateTimeFmt.format(d.lastSeenAt)}
                    {d.revokedAt && ` · разлогинен ${dateTimeFmt.format(d.revokedAt)}`}
                  </span>
                </span>
                {d.revokedAt ? (
                  <span className="badge">неактивно</span>
                ) : (
                  <DeleteButton
                    action={revokeDevice.bind(null, d.id)}
                    confirmText="Разлогинить это устройство? Понадобится войти заново."
                    label="Разлогинить"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="admin-columns">
        <section className="admin-card">
          <h3 className="admin-card__title">Ответы ({user.submissions.length})</h3>
          {user.submissions.length === 0 ? (
            <p className="admin-empty">Тесты ещё не сдавались.</p>
          ) : (
            <ul className="admin-feed">
              {user.submissions.slice(0, 10).map(s => (
                <li key={s.id}>
                  <Link href={`/${locale}/admin/lessons/${s.assignment.lessonId}`}>
                    <strong>{ru(s.assignment.title)}</strong>
                    <span>{s.grade != null ? `${s.grade}%` : 'без оценки'}</span>
                  </Link>
                  <time>{dateFmt.format(s.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card">
          <h3 className="admin-card__title">Платежи ({user.Payment.length})</h3>
          {user.Payment.length === 0 ? (
            <p className="admin-empty">Платежей нет.</p>
          ) : (
            <ul className="admin-feed">
              {user.Payment.map(p => (
                <li key={p.id}>
                  <span>
                    <strong>{ru(p.course.title)}</strong>
                    <span>
                      {p.amountCents} {p.currency} · {p.provider} · {p.status}
                    </span>
                  </span>
                  <time>{dateFmt.format(p.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
