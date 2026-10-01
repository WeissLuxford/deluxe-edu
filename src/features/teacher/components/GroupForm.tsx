'use client'

import { useActionState, useEffect } from 'react'
import { Field, FormError, Input, Section, Submit } from '@/features/staff/form/Form'
import { useRouter } from 'next/navigation'
import type { ActionResult } from '../types'

export function GroupForm({
  action,
  defaultName = '',
  submitLabel,
  redirectTo
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  defaultName?: string
  submitLabel: string
  redirectTo: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction} style={{ maxWidth: 640 }}>
      <Section title="Группа">
        {state && !state.ok && <FormError>{state.error}</FormError>}
        <Field label="Название" required htmlFor="group-name" hint="Например «B1 · Вечерняя» — часть после точки станет курсивом в шапке группы.">
          <Input id="group-name" name="name" defaultValue={defaultName} placeholder="B1 · Вечерняя" maxLength={60} required />
        </Field>
        <Submit pending={pending} label={submitLabel} />
      </Section>
    </form>
  )
}
