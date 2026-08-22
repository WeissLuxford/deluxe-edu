import Link from 'next/link'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { getPendingExamAttempts } from '@/features/teacher/examReview'
import { TeacherPageHead } from '@/features/teacher/components/TeacherPageHead'
import { localized } from '@/lib/localized'

const ru = (value: unknown) => localized(value, 'ru') || '—'

function studentName(user: { name: string | null; phone: string | null; email: string | null }) {
  return user.name || (user.phone ? `+${user.phone}` : user.email) || 'без имени'
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

export default async function TeacherExamsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const teacher = await requireTeacher(locale)
  const attempts = await getPendingExamAttempts(teacher.id)

  return (
    <div className="space-y-6">
      <TeacherPageHead
        title="Контрольные на проверку"
        subtitle={`${attempts.length} ожидают разбора`}
      />

      {attempts.length === 0 ? (
        <div className="admin-card">
          <p className="admin-empty">Пока нет контрольных, ожидающих проверки.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Студент</th>
                  <th>Курс · модуль</th>
                  <th>Результат</th>
                  <th>Отправлено</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {attempts.map(a => (
                  <tr key={a.id}>
                    <td>{studentName(a.user)}</td>
                    <td>
                      {ru(a.exam.module.course.title)} · {ru(a.exam.module.title)}
                    </td>
                    <td>
                      <span className={a.grade >= a.exam.passingScore ? 'badge badge-success' : 'badge badge-warning'}>
                        {a.grade}%
                      </span>
                    </td>
                    <td>{dateFmt.format(a.submittedAt)}</td>
                    <td className="right">
                      <Link href={`/${locale}/teacher/exams/${a.id}`} className="btn btn-secondary btn-sm">
                        Разобрать
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
