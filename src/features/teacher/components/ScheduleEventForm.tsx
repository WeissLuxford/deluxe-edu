'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ActionResult } from '../types'

const TYPE_LABELS: Record<string, string> = {
  LESSON: 'Обычный урок',
  MOCK_TEST: 'Мок-тест',
  EXAM: 'Контрольная',
  SPEAKING_PRACTICE: 'Спикинг',
  OTHER: 'Другое'
}

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ScheduleEventForm({
  action,
  redirectTo,
  submitLabel,
  defaultValues
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  redirectTo: string
  submitLabel: string
  defaultValues?: {
    type: string
    title: string | null
    notes: string | null
    startsAt: Date
    durationMin: number
  }
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction} className="admin-form">
      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}

      <section className="admin-panel">
        <div className="admin-grid">
          <div>
            <label className="label">Тип занятия</label>
            <select name="type" className="select" defaultValue={defaultValues?.type ?? 'LESSON'}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Дата и время</label>
            <input
              type="datetime-local"
              name="startsAt"
              className="input"
              defaultValue={defaultValues ? toLocalInputValue(defaultValues.startsAt) : ''}
              required
            />
          </div>

          <div>
            <label className="label">Длительность, мин</label>
            <input
              type="number"
              name="durationMin"
              className="input"
              defaultValue={defaultValues?.durationMin ?? 60}
              min={5}
              max={600}
              required
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label className="label">Заголовок (необязательно)</label>
          <input
            name="title"
            className="input"
            defaultValue={defaultValues?.title ?? ''}
            placeholder="Например: Итоговый мок-тест по Reading"
            maxLength={120}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label className="label">Заметка (необязательно)</label>
          <textarea
            name="notes"
            className="input"
            rows={3}
            defaultValue={defaultValues?.notes ?? ''}
            maxLength={2000}
          />
        </div>
      </section>

      <div className="admin-savebar">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Сохраняю…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
