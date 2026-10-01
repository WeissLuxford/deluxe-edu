import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/design/components/Bits'
import type { ReportSnapshot } from './collect'
import s from './report.module.css'

// The report is written to a parent, so unlike the rest of the site the
// Russian says «вы» (and the Uzbek «siz», as everywhere). Parents pick the
// language themselves: the same token opens under /ru, /uz and /en.

const LOCALES = ['ru', 'uz', 'en'] as const
const INTL: Record<string, string> = { ru: 'ru-RU', uz: 'uz-UZ', en: 'en-GB' }

const EXAM_CLS: Record<ReportSnapshot['exams'][number]['status'], string> = {
  APPROVED: s.ok,
  PENDING: s.wait,
  REJECTED: s.stop
}

// Intl writes «8-sentabr, 2026»; Uzbek reads «2026-yil 8-sentabr».
const uzMonthFmt = new Intl.DateTimeFormat('uz-UZ', { month: 'long', timeZone: 'UTC' })
const uzMonth = { format: (d: Date) => uzMonthFmt.format(d).toLowerCase() }

// Russian Intl adds «г.», which doubles the full stop at the end of a sentence.
function withoutYearMark(fmt: Intl.DateTimeFormat) {
  return { format: (d: Date) => fmt.format(d).replace(/\s*г\.$/, '') }
}

function dateFormatter(locale: string) {
  if (locale === 'uz') return { format: (d: Date) => `${d.getUTCFullYear()}-yil ${d.getUTCDate()}-${uzMonth.format(d)}` }
  return withoutYearMark(new Intl.DateTimeFormat(INTL[locale] ?? INTL.ru, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))
}

function monthFormatter(locale: string) {
  if (locale === 'uz') return { format: (d: Date) => `${d.getUTCFullYear()}-yil ${uzMonth.format(d)}` }
  return withoutYearMark(new Intl.DateTimeFormat(INTL[locale] ?? INTL.ru, { month: 'long', year: 'numeric', timeZone: 'UTC' }))
}

type Props = {
  data: ReportSnapshot
  comment: string | null
  publishedAt: Date | null
  locale: string
  token: string
  actions?: React.ReactNode
}

export async function ReportView({ data, comment, publishedAt, locale, token, actions }: Props) {
  const t = await getTranslations({ locale, namespace: 'reportPage' })
  const intl = INTL[locale] ?? INTL.ru
  const dateFmt = dateFormatter(locale)
  const shortFmt = new Intl.DateTimeFormat(locale === 'en' ? intl : 'ru-RU', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
  const monthFmt = monthFormatter(locale)
  const rich = { it: (chunks: React.ReactNode) => <span className="it">{chunks}</span> }

  const { attendance, homework, lessons, rank, exams } = data
  const firstName = data.student.name.split(' ')[0] || data.student.name

  return (
    <article className={s.sheet}>
      <header className={s.top}>
        <Logo />
        <div className={s.topSide}>
          <span className={s.period}>{t('period', { period: monthFmt.format(new Date(data.period.start)) })}</span>
          <nav className={s.langs} aria-label={t('language')}>
            {LOCALES.map(l => (
              <Link key={l} href={`/${l}/r/${token}`} hrefLang={l} className={[s.lang, l === locale && s.langOn].filter(Boolean).join(' ')} aria-current={l === locale ? 'page' : undefined}>
                {l.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className={s.intro}>
        <h1 className={s.title}>{t.rich('title', { ...rich, name: firstName })}</h1>
        <p className={s.lead}>{t('lead', { group: data.group.name })}</p>
        {data.membership.partial && (
          <p className={s.note}>
            {data.membership.leftAt
              ? t('partialLeft', { date: dateFmt.format(new Date(data.membership.leftAt)) })
              : t('partialJoined', { date: dateFmt.format(new Date(data.membership.joinedAt)) })}
          </p>
        )}
      </div>

      <div className={s.stats}>
        <div className={`${s.stat} ${s.mint}`}>
          <span className={s.statNum}>
            {attendance.countable > 0 ? (
              <>
                {attendance.present + attendance.late}
                <small>/{attendance.countable}</small>
              </>
            ) : (
              '—'
            )}
          </span>
          <span className={s.statLabel}>{attendance.countable > 0 ? t('attended') : t('noClasses')}</span>
        </div>
        <div className={`${s.stat} ${s.lilac}`}>
          <span className={s.statNum}>{lessons.passed}</span>
          <span className={s.statLabel}>{t('lessons', { count: lessons.passed })}</span>
        </div>
        <div className={`${s.stat} ${s.lime}`}>
          <span className={s.statNum}>{homework.averageGrade != null ? `${homework.averageGrade}%` : '—'}</span>
          <span className={s.statLabel}>{homework.graded > 0 ? t('avgGrade') : t('noGraded')}</span>
        </div>
        {rank.position != null && (
          <div className={`${s.stat} ${s.sky}`}>
            <span className={s.statNum}>
              {rank.position}
              <small>/{rank.of}</small>
            </span>
            <span className={s.statLabel}>{t('rank')}</span>
          </div>
        )}
      </div>

      <div className={s.comment}>
        <span className={s.commentLabel}>{t('teacherWord')}</span>
        {comment ? (
          <>
            <p className={s.commentText}>
              <span className="it">«</span>
              {comment}
              <span className="it">»</span>
            </p>
            <span className={s.commentLabel}>{data.group.teacherName}</span>
          </>
        ) : (
          <p className={s.commentText}>{t('noComment')}</p>
        )}
      </div>

      <div className={s.columns}>
        <section className={s.col}>
          <h2 className={s.h2}>{t('exams')}</h2>
          {exams.length === 0 ? (
            <p className={s.empty}>{t('noExams')}</p>
          ) : (
            exams.map((exam, i) => (
              <div key={i} className={s.row}>
                <span className={s.rowMain}>
                  <span>{exam.title}</span>
                  <span className={s.rowSub}>
                    {shortFmt.format(new Date(exam.submittedAt))}
                    {exam.note ? ` · ${exam.note}` : ''}
                  </span>
                </span>
                <span className={s.rowSide}>
                  {exam.status !== 'PENDING' && <b>{exam.grade}%</b>}
                  <span className={`${s.badge} ${EXAM_CLS[exam.status]}`}>{t(`examStatus.${exam.status}`)}</span>
                </span>
              </div>
            ))
          )}
        </section>
        <section className={s.col}>
          <h2 className={s.h2}>{t('attendance')}</h2>
          {attendance.events === 0 ? (
            <p className={s.empty}>{t('noAttendance')}</p>
          ) : (
            <>
              <div className={s.row}><span>{t('present')}</span><b>{attendance.present}</b></div>
              <div className={s.row}><span>{t('late')}</span><b>{attendance.late}</b></div>
              <div className={s.row}><span>{t('absent')}</span><b>{attendance.absent}</b></div>
              <div className={s.row}><span>{t('excused')}</span><b>{attendance.excused}</b></div>
            </>
          )}
        </section>
      </div>

      <footer className={s.foot}>
        <span>
          {t('footer', {
            generated: dateFmt.format(new Date(data.generatedAt)),
            sent: publishedAt ? t('sent', { date: dateFmt.format(publishedAt) }) : ''
          })}
        </span>
        {actions}
      </footer>
    </article>
  )
}
