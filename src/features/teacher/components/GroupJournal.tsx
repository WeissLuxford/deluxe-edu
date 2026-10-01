import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { Reveal } from '@/design/components/Reveal'
import { ago, plural } from '@/features/staff/format'
import type { Journal, Mark } from '../journal'
import s from './journal.module.css'

const MARKS: Record<Mark, { label: string; cls: string }> = {
  PRESENT: { label: 'был', cls: s.present },
  LATE: { label: 'опоздал', cls: s.late },
  ABSENT: { label: 'пропустил', cls: s.absent },
  EXCUSED: { label: 'по причине', cls: s.excused },
  NONE: { label: 'не отмечено', cls: s.none }
}

const AVATARS = ['var(--lv-a1-bg)', 'var(--lv-a2-bg)', 'var(--lv-b1-bg)', 'var(--lv-b2-bg)', 'var(--lv-c1-bg)', 'var(--c-butter)']

const dayFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'numeric', timeZone: 'Asia/Tashkent' })

type Links = {
  event?: (eventId: string) => string
  review?: (attemptId: string) => string
  reviews?: string
  reports?: string
}

/** "B1 · Вечерняя" → the part after the dot goes italic, as on the canvas. */
function GroupTitle({ name }: { name: string }) {
  const at = name.indexOf(' · ')
  if (at < 0) return <>{name}</>
  return (
    <>
      {name.slice(0, at)} · <span className="it">{name.slice(at + 3)}</span>
    </>
  )
}

export function GroupJournal({
  name,
  journal,
  links = {},
  meta,
  actions,
  nameEditor
}: {
  name: string
  journal: Journal
  links?: Links
  /** Extra words after the rhythm line, like "в архиве". */
  meta?: string
  actions?: ReactNode
  nameEditor?: ReactNode
}) {
  const { students, dates, pending, pendingCount, reports } = journal
  const sub = [journal.rhythm, `${students.length} ${plural(students.length, 'ученик', 'ученика', 'учеников')}`, meta].filter(Boolean).join(' · ')
  const cols = { '--cols': Math.max(dates.length, 1) } as CSSProperties
  const used = new Set(students.flatMap(st => st.marks.map(m => m.mark)))

  return (
    <div className={s.page}>
      <Reveal className={s.head}>
        <div className={s.headText}>
          <span className={s.sub}>{sub}</span>
          <h1 className={s.title}>
            <GroupTitle name={name} />
            {nameEditor}
          </h1>
        </div>
        {actions && <div className={s.actions}>{actions}</div>}
      </Reveal>

      <div className={s.grid}>
        <Reveal delay={60} className={s.card}>
          <div className={s.cardHead}>
            <h2 className={s.cardTitle}>Посещаемость</h2>
            <span className={s.legend}>
              {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const)
                .filter(m => m !== 'EXCUSED' || used.has('EXCUSED'))
                .map(m => (
                  <span key={m} className={s.legendItem}>
                    <span className={`${s.dot} ${MARKS[m].cls}`} />
                    {MARKS[m].label}
                  </span>
                ))}
            </span>
          </div>

          {students.length === 0 ? (
            <p className={s.empty}>В группе пока нет учеников — добавь их ниже.</p>
          ) : dates.length === 0 ? (
            <p className={s.empty}>Занятий ещё не было — отметки появятся после первого.</p>
          ) : (
            <div className={s.scroll}>
              <div className={s.table} style={cols}>
                <div className={`${s.row} ${s.rowHead}`}>
                  <span>Ученик</span>
                  {dates.map(d =>
                    links.event ? (
                      <Link key={d.id} href={links.event(d.id)} className={s.date}>
                        {dayFmt.format(d.startsAt)}
                      </Link>
                    ) : (
                      <span key={d.id} className={s.date}>
                        {dayFmt.format(d.startsAt)}
                      </span>
                    )
                  )}
                  <span className={s.total}>Итого</span>
                </div>
                {students.map((st, i) => (
                  <div key={st.id} className={s.row} data-risk={st.atRisk || undefined}>
                    <span className={s.student}>
                      <span className={s.avatar} style={{ background: AVATARS[i % AVATARS.length] }}>
                        {st.name.charAt(0).toUpperCase()}
                      </span>
                      <span className={s.studentName}>{st.name}</span>
                    </span>
                    {st.marks.map((m, j) => {
                      const look = MARKS[m.mark]
                      const tip = `${look.label} · ${dayFmt.format(dates[j].startsAt)}`
                      return (
                        <span key={m.eventId} className={s.cell}>
                          {links.event ? (
                            <Link href={links.event(m.eventId)} className={`${s.mark} ${look.cls}`} title={tip} aria-label={`${st.name}: ${tip}`} />
                          ) : (
                            <span className={`${s.mark} ${look.cls}`} title={tip} />
                          )}
                        </span>
                      )
                    })}
                    <span className={s.total}>{st.counted ? `${st.came}/${st.counted}` : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Reveal>

        <div className={s.side}>
          <Reveal delay={120} className={s.reviews}>
            <span className={s.bigLine}>
              <span className={s.bigNum}>{pendingCount}</span>
              <span className={s.bigLabel}>{plural(pendingCount, 'ждёт проверки', 'ждут проверки', 'ждут проверки')}</span>
            </span>
            {pending.length === 0 ? (
              <span className={s.reviewsNote}>Всё проверено — можно выдохнуть.</span>
            ) : (
              pending.map(p => {
                const inner = (
                  <>
                    <span className={s.reviewText}>
                      <span className={s.reviewWho}>{p.who}</span>
                      <span className={s.reviewWhat}>{p.what}</span>
                    </span>
                    <span className={s.reviewWhen}>{ago(p.submittedAt).replace(' назад', '')}</span>
                  </>
                )
                return links.review ? (
                  <Link key={p.id} href={links.review(p.id)} className={s.review}>
                    {inner}
                  </Link>
                ) : (
                  <div key={p.id} className={s.review}>
                    {inner}
                  </div>
                )
              })
            )}
            {links.reviews && pendingCount > pending.length && (
              <Link href={links.reviews} className={s.reviewsMore}>
                Ещё {pendingCount - pending.length} →
              </Link>
            )}
          </Reveal>

          <Reveal delay={180} className={s.reports}>
            <h2 className={s.reportsTitle}>{reports ? `Отчёты за ${reports.month}` : 'Отчёты родителям'}</h2>
            {reports ? (
              <>
                <span className={s.progress}>
                  <span className={s.track}>
                    <span className={s.fill} style={{ width: `${reports.total ? Math.round((reports.published / reports.total) * 100) : 0}%` }} />
                  </span>
                  <span className={s.progressNum}>
                    {reports.published} из {reports.total}
                  </span>
                </span>
                <span className={s.reportsText}>
                  {reports.withoutComment > 0
                    ? `Осталось дописать комментарий для ${reports.withoutComment} ${plural(reports.withoutComment, 'ученика', 'учеников', 'учеников')}. Цифры соберутся сами.`
                    : reports.published < reports.total
                      ? 'Комментарии готовы — осталось опубликовать.'
                      : 'Все отчёты ушли родителям.'}
                </span>
              </>
            ) : (
              <span className={s.reportsText}>Цифры за месяц соберутся сами — останется дописать пару слов о каждом.</span>
            )}
            {links.reports && (
              <Link href={links.reports} className={s.reportsLink}>
                {reports ? 'Открыть черновики →' : 'Собрать отчёты →'}
              </Link>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  )
}
