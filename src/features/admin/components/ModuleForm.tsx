'use client'

import { useActionState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { FormError, Submit, formStyles as fs } from '@/features/staff/form/Form'
import { LocalizedField } from './LocalizedField'
import type { ActionResult } from '../actions'

type Props = {
  action: (prev: unknown, form: FormData) => Promise<ActionResult>
  module?: {
    title: Record<string, string>
    description?: Record<string, string> | null
  }
  submitLabel: string
  onSuccess?: () => void
}

export function ModuleForm({ action, module, submitLabel, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, { ok: false })

  useEffect(() => {
    if (state?.ok) onSuccess?.()
  }, [state, onSuccess])

  return (
    <form action={formAction} className={fs.stack}>
      <LocalizedField
        name="title"
        label="Название модуля"
        value={module?.title ?? {}}
        required
      />

      <LocalizedField
        name="description"
        label="Описание модуля"
        value={module?.description ?? {}}
        textarea
        rows={2}
        hint="Короткое вступление к модулю — студент видит его над карточками уроков"
      />

      {state?.error && <FormError>{state.error}</FormError>}

      <Submit pending={pending} label={submitLabel} pendingLabel="Сохраняем…" icon={<Plus size={16} />} />
    </form>
  )
}
