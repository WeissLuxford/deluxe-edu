import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { GraduationCap, CreditCard, ClipboardCheck } from 'lucide-react'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

const ru = (value: unknown) => localized(value, 'ru') || '—'

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

export default async function StudentHistory({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      enrollments: {
        orderBy: { createdAt: 'desc' },
        include: { course: { select: { id: true, title: true } } }
      },
      submissions: {
        orderBy: { createdAt: 'desc' },
        include: { assignment: { select: { title: true, lessonId: true } } }
      },
      Payment: { orderBy: { createdAt: 'desc' }, include: { course: { select: { title: true } } } }
    }
  })

  if (!user) notFound()

  type Event = { date: Date; href?: string; title: ReactNode; meta: ReactNode }

  const events: Event[] = [
    ...user.enrollments.map((e): Event => ({
      date: e.createdAt,
      href: `/${locale}/admin/courses/${e.course.id}`,
      title: (
        <>
          <GraduationCap size={13} /> Запись на курс «{ru(e.course.title)}»
        </>
      ),
      meta: (
        <span className={`badge${e.status === 'ACTIVE' ? ' badge-success' : ' badge-warning'}`}>
          {e.status === 'ACTIVE' ? e.plan || 'BASIC' : 'доступ отозван'}
        </span>
      )
    })),
    ...user.Payment.map((p): Event => ({
      date: p.createdAt,
      title: (
        <>
          <CreditCard size={13} /> Платёж за «{ru(p.course.title)}»
        </>
      ),
      meta: (
        <span className="badge">
          {p.amountCents} {p.currency} · {p.provider} · {p.status}
        </span>
      )
    })),
    ...user.submissions.map((s): Event => ({
      date: s.createdAt,
      href: `/${locale}/admin/lessons/${s.assignment.lessonId}`,
      title: (
        <>
          <ClipboardCheck size={13} /> Тест «{ru(s.assignment.title)}»
        </>
      ),
      meta: <span className="badge">{s.grade != null ? `${s.grade}%` : 'без оценки'}</span>
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || 'без имени'

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/students/${id}`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К карточке студента
      </Link>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
        Журнал: {name}
      </h2>
      <p className="hint">
        Записи на курсы, платежи и сданные тесты — в порядке времени. Дата у записи на курс —
        это момент выдачи доступа; точный момент отзыва система пока не хранит, только текущий
        статус.
      </p>

      {events.length === 0 ? (
        <div className="admin-empty">Событий пока нет.</div>
      ) : (
        <ul className="admin-feed">
          {events.map((e, i) =>
            e.href ? (
              <li key={i}>
                <Link href={e.href}>
                  <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    {e.title}
                  </strong>
                  <span>{e.meta}</span>
                </Link>
                <time>{dateFmt.format(e.date)}</time>
              </li>
            ) : (
              <li key={i}>
                <span>
                  <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    {e.title}
                  </strong>
                  <span>{e.meta}</span>
                </span>
                <time>{dateFmt.format(e.date)}</time>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}
