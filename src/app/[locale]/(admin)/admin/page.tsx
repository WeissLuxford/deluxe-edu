import Link from 'next/link'
import { prisma } from '@/lib/db'
import { dayBounds } from '@/lib/day'
import { localized } from '@/lib/localized'
import { formatPhone } from '@/features/auth/identity'
import { requireAdmin } from '@/features/admin/requireAdmin'
import { ago, greeting, timeFmt } from '@/features/staff/format'
import { Reveal } from '@/design/components/Reveal'
import s from '@/features/admin/overview.module.css'

// Where a lead came from — a short word and a level pastel, as on the canvas.
const SOURCES: Record<string, { label: string; look: string }> = {
  HOME_FORM: { label: 'Сайт', look: 'b1' },
  COURSE_PAGE: { label: 'Курс', look: 'b1' },
  CONTACTS_PAGE: { label: 'Контакты', look: 'b1' },
  TRIAL_LESSON: { label: 'Пробный урок', look: 'a2' },
  LEVEL_TEST: { label: 'Тест уровня', look: 'a1' },
  LANDING: { label: 'Лендинг', look: 'b2' }
}

const EVENT_TYPES: Record<string, string> = {
  LESSON: 'Занятие',
  MOCK_TEST: 'Мок-тест',
  EXAM: 'Контрольная',
  SPEAKING_PRACTICE: 'Спикинг',
  OTHER: 'Встреча'
}

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireAdmin(locale)
  const base = `/${locale}/admin`
  const now = new Date()
  const today = dayBounds(now)
  const weekAgo = new Date(+now - 7 * 86_400_000)

  const [leadsToday, students, activeWeek, pendingReviews, leads, streams, events] = await Promise.all([
    prisma.contactRequest.count({ where: { createdAt: { gte: today.start } } }),
    prisma.user.count({ where: { enrollments: { some: { status: 'ACTIVE' } } } }),
    prisma.user.count({ where: { LessonProgress: { some: { updatedAt: { gte: weekAgo } } } } }),
    prisma.examAttempt.count({ where: { reviewStatus: 'PENDING' } }),
    prisma.contactRequest.findMany({
      where: { status: { not: 'SPAM' } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, firstName: true, lastName: true, phone: true, source: true, status: true, createdAt: true }
    }),
    prisma.stream.findMany({
      where: { published: true, startsAt: { gte: today.start, lt: today.end } },
      orderBy: { startsAt: 'asc' },
      select: { id: true, title: true, startsAt: true }
    }),
    prisma.scheduleEvent.findMany({
      where: { startsAt: { gte: today.start, lt: today.end }, group: { archived: false } },
      orderBy: { startsAt: 'asc' },
      select: {
        id: true,
        type: true,
        title: true,
        startsAt: true,
        group: { select: { id: true, name: true, teacherId: true, teacher: { select: { name: true } }, _count: { select: { members: { where: { leftAt: null } } } } } }
      }
    })
  ])

  const kpis = [
    { label: 'Новые заявки', value: leadsToday, hint: 'за сегодня', look: s.kpiLime, href: `${base}/contacts` },
    { label: 'Студенты', value: students, hint: 'с активным доступом', look: s.kpiWhite, href: `${base}/students` },
    { label: 'Учились за неделю', value: activeWeek, hint: 'хотя бы один урок', look: s.kpiLavender, href: `${base}/students` },
    { label: 'Ждут проверки', value: pendingReviews, hint: 'контрольные', look: s.kpiPeach, href: `${base}/teachers` }
  ]

  const onAir = [
    ...streams.map(st => ({
      id: `s-${st.id}`,
      at: st.startsAt,
      title: localized(st.title, 'ru') || 'Эфир',
      who: 'Эфир для всех',
      href: `${base}/streams/${st.id}`
    })),
    ...events.map(e => ({
      id: `e-${e.id}`,
      at: e.startsAt,
      title: e.title || EVENT_TYPES[e.type] || 'Занятие',
      who: `${e.group.teacher.name || 'Преподаватель'} · ${e.group.name} · ${e.group._count.members} чел.`,
      href: `${base}/teachers/${e.group.teacherId}/groups/${e.group.id}`
    }))
  ].sort((a, b) => +a.at - +b.at)

  return (
    <div className={s.page}>
      <Reveal className={s.head}>
        <h1 className={s.title}>
          {greeting(now)} <span className="it">Вот что нового</span>
        </h1>
        <form action={`${base}/students`} className={s.search} role="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input name="q" aria-label="Поиск" placeholder="Студент или телефон" autoComplete="off" />
        </form>
      </Reveal>

      <div className={s.kpis}>
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 60}>
            <Link href={k.href} className={`${s.kpi} ${k.look}`}>
              <span className={s.kpiLabel}>{k.label}</span>
              <span className={s.kpiValue}>{k.value}</span>
              <span className={s.kpiHint}>{k.hint}</span>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className={s.cols}>
        <Reveal delay={120} className={s.leads}>
          <div className={s.boxHead}>
            <h2 className={s.boxTitle}>Новые заявки</h2>
            <Link href={`${base}/contacts`} className={s.more}>
              Все заявки →
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className={s.empty}>Заявок пока нет — как только кто-то оставит телефон, он появится здесь.</p>
          ) : (
            leads.map(l => {
              const src = SOURCES[l.source] ?? SOURCES.HOME_FORM
              const fresh = l.status === 'NEW'
              return (
                <div key={l.id} className={s.lead} data-fresh={fresh || undefined}>
                  <span className={s.leadName}>{[l.firstName, l.lastName].filter(Boolean).join(' ')}</span>
                  <span className={s.leadPhone}>{formatPhone(l.phone)}</span>
                  <span>
                    <span className={s.source} style={{ background: `var(--lv-${src.look}-bg)`, color: `var(--lv-${src.look}-fg)` }}>
                      {src.label}
                    </span>
                  </span>
                  <span className={s.leadWhen}>{ago(l.createdAt, now)}</span>
                  {fresh ? (
                    <a href={`tel:+${l.phone.replace(/\D/g, '')}`} className={s.call}>
                      Позвонить
                    </a>
                  ) : (
                    <Link href={`${base}/contacts`} className={s.done}>
                      {l.status === 'CONTACTED' ? 'Связались' : 'Готово'}
                    </Link>
                  )}
                </div>
              )
            })
          )}
        </Reveal>

        <div className={s.side}>
          <Reveal delay={180} className={s.air}>
            <h2 className={s.sideTitle}>Сегодня в эфире</h2>
            {onAir.length === 0 ? (
              <p className={s.airEmpty}>Сегодня занятий и эфиров нет.</p>
            ) : (
              onAir.map(a => (
                <Link key={a.id} href={a.href} className={s.airRow}>
                  <span className={s.airTime}>{timeFmt.format(a.at)}</span>
                  <span className={s.airText}>
                    <span className={s.airTitle}>{a.title}</span>
                    <span className={s.airWho}>{a.who}</span>
                  </span>
                </Link>
              ))
            )}
          </Reveal>

          <Reveal delay={240} className={s.quick}>
            <h2 className={s.sideTitle}>Быстро</h2>
            <Link href={`${base}/students`} className={s.quickLink}>
              Открыть доступ к курсу
            </Link>
            <Link href={`${base}/courses`} className={s.quickLink}>
              Новый урок
            </Link>
            <Link href={`${base}/streams/new`} className={s.quickLink}>
              Запланировать эфир
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
