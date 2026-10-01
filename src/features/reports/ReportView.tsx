import type { ReportSnapshot } from './collect'

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })

const EXAM_STATUS: Record<ReportSnapshot['exams'][number]['status'], { label: string; cls: string }> = {
  APPROVED: { label: 'зачтено', cls: 'doc-badge--ok' },
  PENDING: { label: 'на проверке', cls: 'doc-badge--wait' },
  REJECTED: { label: 'не зачтено', cls: 'doc-badge--stop' }
}

// «1 урок», «2 урока», «5 уроков» — иначе отчёт читается как машинный.
function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export function ReportView({
  data,
  comment,
  publishedAt
}: {
  data: ReportSnapshot
  comment: string | null
  publishedAt: Date | null
}) {
  const { attendance, homework, lessons, rank, exams, speaking } = data
  const joined = new Date(data.membership.joinedAt)

  return (
    <article className="doc">
      <header className="doc-head">
        <span className="doc-brand">Highgate · отчёт за месяц</span>
        <span className="doc-period">{data.period.label}</span>
      </header>

      <h1 className="doc-title">{data.student.name}</h1>
      <p className="doc-sub">
        Группа «{data.group.name}» · преподаватель {data.group.teacherName}
      </p>

      {data.membership.partial && (
        <p className="doc-note">
          {data.membership.leftAt
            ? `Отчёт охватывает часть месяца: занятия в группе закончились ${dateFmt.format(
                new Date(data.membership.leftAt)
              )}.`
            : `Отчёт охватывает часть месяца: занятия в группе начались ${dateFmt.format(joined)}.`}
        </p>
      )}

      <section className="doc-section">
        <h2 className="doc-section__title">Коротко</h2>
        <div className="doc-stats">
          <div className="doc-stat">
            <div className="doc-stat__value">
              {homework.averageGrade != null ? homework.averageGrade : '—'}
            </div>
            <div className="doc-stat__label">Средний балл за домашние</div>
            <div className="doc-stat__hint">
              {homework.graded > 0
                ? `проверено ${homework.graded} из ${homework.submitted}`
                : 'проверенных работ нет'}
            </div>
          </div>

          <div className="doc-stat">
            <div className="doc-stat__value">
              {attendance.ratePercent != null ? `${attendance.ratePercent}%` : '—'}
            </div>
            <div className="doc-stat__label">Посещаемость</div>
            <div className="doc-stat__hint">
              {attendance.countable > 0
                ? `${attendance.present + attendance.late} из ${attendance.countable} занятий`
                : 'занятий в этом месяце не было'}
            </div>
          </div>

          <div className="doc-stat">
            <div className="doc-stat__value">{lessons.passed}</div>
            <div className="doc-stat__label">
              {plural(lessons.passed, 'Урок пройден', 'Урока пройдено', 'Уроков пройдено')}
            </div>
            <div className="doc-stat__hint">за {data.period.label}</div>
          </div>

          <div className="doc-stat">
            <div className="doc-stat__value">
              {rank.position != null ? rank.position : '—'}
              {rank.position != null && (
                <span style={{ fontSize: '1rem', color: 'var(--muted)' }}> из {rank.of}</span>
              )}
            </div>
            <div className="doc-stat__label">Место в группе</div>
            <div className="doc-stat__hint">по урокам за месяц</div>
          </div>
        </div>
      </section>

      <section className="doc-section">
        <h2 className="doc-section__title">Посещаемость</h2>
        {attendance.events === 0 ? (
          <p className="doc-empty">В этом месяце занятий по расписанию не было.</p>
        ) : (
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Был</th>
                  <th>Опоздал</th>
                  <th>Пропустил</th>
                  <th>По уважительной</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="num">{attendance.present}</td>
                  <td className="num">{attendance.late}</td>
                  <td className="num">{attendance.absent}</td>
                  <td className="num">{attendance.excused}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="doc-section">
        <h2 className="doc-section__title">Контрольные</h2>
        {exams.length === 0 ? (
          <p className="doc-empty">Контрольных в этом месяце не было.</p>
        ) : (
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Работа</th>
                  <th>Дата</th>
                  <th>Результат</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, i) => (
                  <tr key={i}>
                    <td>
                      {exam.title}
                      {exam.note && (
                        <div style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                          {exam.note}
                        </div>
                      )}
                    </td>
                    <td className="num">{shortFmt.format(new Date(exam.submittedAt))}</td>
                    <td className="num">
                      {/* Пока работу не проверили, оценка — ещё не оценка. */}
                      {exam.status === 'PENDING' ? '—' : `${exam.grade}% · ${exam.correct} из ${exam.total}`}
                    </td>
                    <td>
                      <span className={`doc-badge ${EXAM_STATUS[exam.status].cls}`}>
                        {EXAM_STATUS[exam.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {speaking.completed > 0 && (
        <section className="doc-section">
          <h2 className="doc-section__title">Разговорная практика</h2>
          <p className="doc-sub">
            {speaking.completed}{' '}
            {plural(speaking.completed, 'диалог пройден', 'диалога пройдено', 'диалогов пройдено')}, записано{' '}
            {speaking.recordings} {plural(speaking.recordings, 'реплика', 'реплики', 'реплик')}.
          </p>
        </section>
      )}

      <section className="doc-section">
        <h2 className="doc-section__title">Комментарий преподавателя</h2>
        {comment ? (
          <>
            <div className="doc-comment">{comment}</div>
            <p className="doc-comment__author">— {data.group.teacherName}</p>
          </>
        ) : (
          <p className="doc-empty">Преподаватель не оставил комментарий к этому месяцу.</p>
        )}
      </section>

      <footer className="doc-foot">
        Отчёт сформирован {dateFmt.format(new Date(data.generatedAt))}
        {publishedAt ? `, отправлен ${dateFmt.format(publishedAt)}` : ''}. Числа в нём зафиксированы на
        момент составления и больше не меняются.
        <br />
        Ссылка личная — она открывает только этот отчёт.
      </footer>
    </article>
  )
}
