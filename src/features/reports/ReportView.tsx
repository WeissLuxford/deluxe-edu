import { Logo } from '@/design/components/Bits'
import type { ReportSnapshot } from './collect'
import s from './report.module.css'

// The report is written to a parent, so unlike the rest of the site it says
// «вы». It is Russian-only for now, like the snapshot it renders.

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })

const EXAM_STATUS: Record<ReportSnapshot['exams'][number]['status'], { label: string; cls: string }> = {
  APPROVED: { label: 'зачтено', cls: s.ok },
  PENDING: { label: 'на проверке', cls: s.wait },
  REJECTED: { label: 'не зачтено', cls: s.stop }
}

// «1 урок», «2 урока», «5 уроков» — otherwise the report reads like a machine wrote it.
function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export function ReportView({ data, comment, publishedAt, actions }: { data: ReportSnapshot; comment: string | null; publishedAt: Date | null; actions?: React.ReactNode }) {
  const { attendance, homework, lessons, rank, exams, speaking } = data
  const firstName = data.student.name.split(' ')[0] || data.student.name

  return (
    <article className={s.sheet}>
      <header className={s.top}>
        <Logo />
        <span className={s.period}>Отчёт за {data.period.label}</span>
      </header>

      <div className={s.intro}>
        <h1 className={s.title}>
          Как дела у {firstName} <span className="it">в этом месяце</span>
        </h1>
        <p className={s.lead}>
          Здравствуйте! Это короткий отчёт от преподавателя группы «{data.group.name}». Здесь всё, что важно знать за месяц.
        </p>
        {data.membership.partial && (
          <p className={s.note}>
            {data.membership.leftAt
              ? `Отчёт охватывает часть месяца: занятия в группе закончились ${dateFmt.format(new Date(data.membership.leftAt))}.`
              : `Отчёт охватывает часть месяца: занятия в группе начались ${dateFmt.format(new Date(data.membership.joinedAt))}.`}
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
          <span className={s.statLabel}>{attendance.countable > 0 ? 'занятий посетил(а)' : 'занятий по расписанию не было'}</span>
        </div>
        <div className={`${s.stat} ${s.lilac}`}>
          <span className={s.statNum}>{lessons.passed}</span>
          <span className={s.statLabel}>{plural(lessons.passed, 'урок пройден', 'урока пройдено', 'уроков пройдено')}</span>
        </div>
        <div className={`${s.stat} ${s.lime}`}>
          <span className={s.statNum}>{homework.averageGrade != null ? `${homework.averageGrade}%` : '—'}</span>
          <span className={s.statLabel}>{homework.graded > 0 ? 'средний балл за тесты' : 'проверенных работ нет'}</span>
        </div>
        {rank.position != null && (
          <div className={`${s.stat} ${s.sky}`}>
            <span className={s.statNum}>
              {rank.position}
              <small>/{rank.of}</small>
            </span>
            <span className={s.statLabel}>место в группе по урокам</span>
          </div>
        )}
      </div>

      <div className={s.comment}>
        <span className={s.commentLabel}>Слово преподавателя</span>
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
          <p className={s.commentText}>Преподаватель не оставил комментарий к этому месяцу.</p>
        )}
      </div>

      <div className={s.columns}>
        <section className={s.col}>
          <h2 className={s.h2}>Контрольные</h2>
          {exams.length === 0 ? (
            <p className={s.empty}>Контрольных в этом месяце не было.</p>
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
                  <span className={`${s.badge} ${EXAM_STATUS[exam.status].cls}`}>{EXAM_STATUS[exam.status].label}</span>
                </span>
              </div>
            ))
          )}
        </section>
        <section className={s.col}>
          <h2 className={s.h2}>Посещаемость</h2>
          {attendance.events === 0 ? (
            <p className={s.empty}>В этом месяце занятий по расписанию не было.</p>
          ) : (
            <>
              <div className={s.row}><span>Был(а)</span><b>{attendance.present}</b></div>
              <div className={s.row}><span>Опоздал(а)</span><b>{attendance.late}</b></div>
              <div className={s.row}><span>Пропустил(а)</span><b>{attendance.absent}</b></div>
              <div className={s.row}><span>По уважительной</span><b>{attendance.excused}</b></div>
            </>
          )}
          {speaking.completed > 0 && (
            <p className={s.empty}>
              Разговорная практика: {speaking.completed} {plural(speaking.completed, 'диалог', 'диалога', 'диалогов')}, {speaking.recordings}{' '}
              {plural(speaking.recordings, 'записанная реплика', 'записанные реплики', 'записанных реплик')}.
            </p>
          )}
        </section>
      </div>

      <footer className={s.foot}>
        <span>
          Отчёт сформирован {dateFmt.format(new Date(data.generatedAt))}
          {publishedAt ? `, отправлен ${dateFmt.format(publishedAt)}` : ''}. Числа зафиксированы на момент составления. Ссылка личная — она открывает только этот отчёт.
        </span>
        {actions}
      </footer>
    </article>
  )
}
