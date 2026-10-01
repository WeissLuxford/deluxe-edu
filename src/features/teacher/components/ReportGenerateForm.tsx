'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ActionResult } from '../types'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

export function ReportGenerateForm({
  action
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)

  useEffect(() => {
    if (state?.ok) router.refresh()
  }, [state, router])

  // По умолчанию — прошлый месяц: отчёт составляют за месяц, который уже закончился.
  const now = new Date()
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const years = [previous.getFullYear() - 1, previous.getFullYear(), previous.getFullYear() + 1]

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="label" htmlFor="report-month">Месяц</label>
        <select
          id="report-month"
          name="month"
          className="select"
          defaultValue={String(previous.getMonth())}
        >
          {MONTHS.map((label, i) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="report-year">Год</label>
        <select
          id="report-year"
          name="year"
          className="select"
          defaultValue={String(previous.getFullYear())}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Собираю…' : 'Собрать отчёты'}
      </button>

      {state && (
        <div
          className={state.ok ? 'alert alert-success' : 'alert alert-error'}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {state.ok ? state.error ?? 'Готово' : state.error}
        </div>
      )}
    </form>
  )
}
