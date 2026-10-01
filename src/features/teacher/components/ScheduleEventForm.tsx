'use client'

import { useActionState, useEffect } from 'react'
import { Chips, Field, FormError, Input, Row, Section, Submit, Textarea } from '@/features/staff/form/Form'
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
    <form action={formAction} style={{ maxWidth: 820 }}>
      <Section title="Занятие">
        {state && !state.ok && <FormError>{state.error}</FormError>}

        <Field label="Тип">
          <Chips name="type" defaultValue={defaultValues?.type ?? 'LESSON'} options={Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
        </Field>

        <Row min={220}>
          <Field label="Дата и время" required htmlFor="ev-start">
            <Input id="ev-start" type="datetime-local" name="startsAt" defaultValue={defaultValues ? toLocalInputValue(defaultValues.startsAt) : ''} required />
          </Field>
          <Field label="Длительность, мин" htmlFor="ev-duration">
            <Input id="ev-duration" type="number" name="durationMin" defaultValue={defaultValues?.durationMin ?? 60} min={5} max={600} required />
          </Field>
        </Row>

        <Field label="Заголовок" htmlFor="ev-title" hint="Необязательно. Без него в расписании будет тип занятия.">
          <Input id="ev-title" name="title" defaultValue={defaultValues?.title ?? ''} placeholder="Итоговый мок-тест по Reading" maxLength={120} />
        </Field>

        <Field label="Заметка для себя" htmlFor="ev-notes">
          <Textarea id="ev-notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ''} maxLength={2000} placeholder="Необязательно" />
        </Field>

        <Submit pending={pending} label={submitLabel} />
      </Section>
    </form>
  )
}
