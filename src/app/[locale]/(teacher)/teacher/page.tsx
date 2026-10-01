import Link from 'next/link'
import { prisma } from '@/lib/db'
import { dayBounds } from '@/lib/day'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { greeting, plural, timeFmt } from '@/features/staff/format'
import { Reveal } from '@/design/components/Reveal'
import s from '@/features/teacher/schedule.module.css'

const TYPE_LABELS: Record<string, string> = {
  LESSON: 'Занятие',
  MOCK_TEST: 'Мок-тест',
  EXAM: 'Контрольная',
  SPEAKING_PRACTICE: 'Спикинг',
  OTHER: 'Встреча'
}

// Each kind of class keeps one pastel, so a glance tells a test from a lesson.
const TYPE_LOOKS: Record<string, string> = {
  LESSON: 'b1',
  MOCK_TEST: 'b2',
  EXAM: 'b2',
  SPEAKING_PRACTICE: 'a2',
  OTHER: 'a1'
}

const dayFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Tashkent' })
const DAY_MS = 86_400_000
const DAYS_AHEAD = 14

export default async function TeacherSchedule({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const teacher = await requireTeacher(locale)
  const base = `/${locale}/teacher`
  const now = new Date()
  const today = dayBounds(now)

  const events = await prisma.scheduleEvent.findMany({
    where: {
      group: { teacherId: teacher.id, archived: false },
      startsAt: { gte: today.start, lt: new Date(+today.start + DAYS_AHEAD * DAY_MS) }
    },
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      type: true,
      title: true,
      startsAt: true,
      durationMin: true,
      group: { select: { id: true, name: true, _count: { select: { members: { where: { leftAt: null } } } } } }
    }
  })

  // Group by Tashkent day; "today" and "tomorrow" get words instead of dates.
  const days: { key: number; label: string; items: typeof events }[] = []
  for (const e of events) {
    const key = Math.floor((+dayBounds(e.startsAt).start - +today.start) / DAY_MS)
    let day = days.find(d => d.key === key)
    if (!day) {
      const label = key === 0 ? 'Сегодня' : key === 1 ? 'Завтра' : dayFmt.format(e.startsAt)
      day = { key, label: label.charAt(0).toUpperCase() + label.slice(1), items: [] }
      days.push(day)
    }
    day.items.push(e)
  }

  const todayCount = days.find(d => d.key === 0)?.items.length ?? 0
  const firstName = (teacher.name || '').split(' ')[0]

  return (
    <div className={s.page}>
      <Reveal className={s.head}>
        <span className={s.sub}>
          {todayCount > 0 ? `Сегодня ${todayCount} ${plural(todayCount, 'занятие', 'занятия', 'занятий')}` : 'Сегодня занятий нет'}
        </span>
        <h1 className={s.title}>
          {greeting(now).replace('.', firstName ? `, ${firstName}!` : '!')} <span className="it">Твоя неделя</span>
        </h1>
      </Reveal>

      {days.length === 0 ? (
        <Reveal delay={60} className={s.empty}>
          <span className={s.emptyTitle}>Ближайшие две недели свободны</span>
          <span className={s.emptyText}>Занятия ставятся в группе — открой её и нажми «Новое занятие».</span>
          <Link href={`${base}/groups`} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            К группам
          </Link>
        </Reveal>
      ) : (
        days.map((day, i) => (
          <Reveal key={day.key} delay={Math.min(i, 4) * 60} as="section" className={s.day}>
            <h2 className={s.dayTitle}>{day.label}</h2>
            <div className={s.list}>
              {day.items.map(e => {
                const live = +e.startsAt <= +now && +now < +e.startsAt + e.durationMin * 60_000
                const look = TYPE_LOOKS[e.type] ?? 'b1'
                return (
                  <Link key={e.id} href={`${base}/groups/${e.group.id}/schedule/${e.id}`} className={s.row} data-live={live || undefined}>
                    <span className={s.time}>{timeFmt.format(e.startsAt)}</span>
                    <span className={s.text}>
                      <span className={s.rowTitle}>{e.title || TYPE_LABELS[e.type]}</span>
                      <span className={s.rowMeta}>
                        {e.group.name} · {e.group._count.members} {plural(e.group._count.members, 'ученик', 'ученика', 'учеников')} · {e.durationMin} мин
                      </span>
                    </span>
                    <span className={s.tag} style={{ background: `var(--lv-${look}-bg)`, color: `var(--lv-${look}-fg)` }}>
                      {TYPE_LABELS[e.type]}
                    </span>
                    {live && <span className={s.start}>Идёт сейчас</span>}
                  </Link>
                )
              })}
            </div>
          </Reveal>
        ))
      )}
    </div>
  )
}
