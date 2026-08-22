'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { reviewExamAttempt } from '../examActions'

export function ExamReviewForm({ attemptId, locale }: { attemptId: string; locale: string }) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = (decision: 'APPROVED' | 'REJECTED') => {
    setError(null)
    const form = new FormData()
    form.set('decision', decision)
    form.set('note', note)

    startTransition(async () => {
      const res = await reviewExamAttempt(attemptId, null, form)
      if (res.ok) {
        router.push(`/${locale}/teacher/exams`)
        router.refresh()
      } else {
        setError(res.error ?? 'Не получилось сохранить решение')
      }
    })
  }

  return (
    <section className="admin-card">
      <h3 className="admin-card__title">Решение</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <label className="label">Комментарий студенту (необязательно)</label>
      <textarea
        className="textarea"
        rows={3}
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Что стоит повторить перед пересдачей"
      />

      <div className="flex items-center gap-3" style={{ marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => submit('APPROVED')}
          disabled={pending}
        >
          <CheckCircle2 size={16} />
          Разрешить переход дальше
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => submit('REJECTED')}
          disabled={pending}
        >
          <XCircle size={16} />
          Отправить на пересдачу
        </button>
      </div>
    </section>
  )
}
