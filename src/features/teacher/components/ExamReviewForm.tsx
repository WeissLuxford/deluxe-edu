'use client'

import { useState, useTransition } from 'react'
import { Field, FormError, Section, Textarea, formStyles as fs } from '@/features/staff/form/Form'
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
    <Section title="Решение">
      {error && <FormError>{error}</FormError>}

      <Field label="Комментарий ученику" htmlFor="review-note" hint="Необязательно. Ученик увидит его рядом с результатом.">
        <Textarea id="review-note" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Что стоит повторить перед пересдачей" />
      </Field>

      <div className={fs.actions}>
        <button type="button" className={fs.inlineSubmit} style={{ background: 'var(--c-lime)', color: 'var(--c-ink)' }} onClick={() => submit('APPROVED')} disabled={pending}>
          <CheckCircle2 size={18} />
          Засчитать — дальше по курсу
        </button>
        <button type="button" className={fs.sideBtn} onClick={() => submit('REJECTED')} disabled={pending}>
          <XCircle size={18} />
          На пересдачу
        </button>
      </div>
    </Section>
  )
}
