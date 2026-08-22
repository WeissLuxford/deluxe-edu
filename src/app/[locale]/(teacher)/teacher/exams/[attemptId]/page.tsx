import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { requireOwnedStudentAttempt } from '@/features/teacher/ownership'
import { ExamReviewForm } from '@/features/teacher/components/ExamReviewForm'
import { TeacherPageHead } from '@/features/teacher/components/TeacherPageHead'
import { localized } from '@/lib/localized'

const ru = (value: unknown) => localized(value, 'ru') || '—'

function studentName(user: { name: string | null; phone: string | null; email: string | null }) {
  return user.name || (user.phone ? `+${user.phone}` : user.email) || 'без имени'
}

function readQuestions(prompt: unknown) {
  const p = prompt as { questions?: unknown }
  return Array.isArray(p?.questions) ? (p.questions as any[]) : []
}

export default async function TeacherExamAttemptPage({
  params
}: {
  params: Promise<{ locale: string; attemptId: string }>
}) {
  const { locale, attemptId } = await params
  const teacher = await requireTeacher(locale)

  const attempt = await requireOwnedStudentAttempt(attemptId, teacher.id)
  if (!attempt) notFound()

  const questions = readQuestions(attempt.exam.prompt)
  const answerKey = (attempt.exam.answerKey as Record<string, unknown>) ?? {}
  const answers = (attempt.answer as Record<string, unknown>) ?? {}

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/teacher/exams`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку контрольных
      </Link>

      <TeacherPageHead
        title={ru(attempt.exam.title)}
        subtitle={`${studentName(attempt.user)} · ${ru(attempt.exam.module.course.title)} · ${ru(attempt.exam.module.title)}`}
      />

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat__label">Результат</span>
          <span className="admin-stat__value">{attempt.grade}%</span>
          <span className="admin-stat__hint">порог {attempt.exam.passingScore}%</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">Верных ответов</span>
          <span className="admin-stat__value">
            {attempt.correct}/{attempt.total}
          </span>
        </div>
      </div>

      <section className="admin-card">
        <h3 className="admin-card__title">Ответы по вопросам</h3>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const given = answers[q.id]
            const expected = answerKey[q.id]
            const givenText = Array.isArray(given) ? given.join(', ') : String(given ?? '—')
            const expectedText = Array.isArray(expected) ? expected.join(', ') : String(expected ?? '—')
            const isCorrect = JSON.stringify(given) === JSON.stringify(expected)

            return (
              <div key={q.id} className="card" style={{ padding: '1rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                  <strong>
                    {idx + 1}. {ru(q.question)}
                  </strong>
                  <span className={isCorrect ? 'badge badge-success' : 'badge badge-error'}>
                    {isCorrect ? 'верно' : 'неверно'}
                  </span>
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Ответ студента: <span style={{ color: 'var(--fg)' }}>{givenText}</span>
                </div>
                {!isCorrect && (
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    Правильный ответ: <span style={{ color: 'var(--fg)' }}>{expectedText}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <ExamReviewForm attemptId={attempt.id} locale={locale} />
    </div>
  )
}
