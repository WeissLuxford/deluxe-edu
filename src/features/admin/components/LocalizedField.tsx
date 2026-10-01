'use client'

import { useState } from 'react'
import { Field, Input, Textarea, formStyles as s } from '@/features/staff/form/Form'
import { LOCALES, LocaleSwitch, useLocaleTab, type LocaleKey } from './LocaleTabs'

type Localized = { ru?: string; uz?: string; en?: string }

export function LocalizedField({
  name,
  label,
  value,
  textarea = false,
  rows = 3,
  required = false,
  hint,
  maxLength,
  onRuChange
}: {
  name: string
  label: string
  value: Localized
  textarea?: boolean
  rows?: number
  required?: boolean
  hint?: string
  maxLength?: number
  onRuChange?: (value: string) => void
}) {
  const [active, setActive] = useLocaleTab()
  const [values, setValues] = useState<Localized>({
    ru: value.ru ?? '',
    uz: value.uz ?? '',
    en: value.en ?? ''
  })

  const set = (key: LocaleKey, v: string) => {
    setValues(prev => ({ ...prev, [key]: v }))
    if (key === 'ru') onRuChange?.(v)
  }

  const current = values[active] ?? ''
  const filled = Object.fromEntries(LOCALES.map(l => [l.key, (values[l.key] ?? '').trim().length > 0]))
  const id = `lf-${name}`
  const common = {
    id,
    value: current,
    maxLength,
    // Only Russian is mandatory; the other languages fall back to it.
    required: required && active === 'ru',
    onChange: (e: { target: { value: string } }) => set(active, e.target.value)
  }

  return (
    <Field
      label={label}
      required={required}
      htmlFor={id}
      hint={hint}
      extra={<LocaleSwitch active={active} onChange={setActive} filled={filled} />}
      foot={
        maxLength ? (
          <span className={s.counter} data-warn={current.length > maxLength * 0.9 || undefined}>
            {current.length} / {maxLength}
          </span>
        ) : undefined
      }
    >
      {LOCALES.map(l => (
        <input key={l.key} type="hidden" name={`${name}_${l.key}`} value={values[l.key] ?? ''} />
      ))}
      {textarea ? <Textarea {...common} rows={rows} /> : <Input {...common} />}
    </Field>
  )
}
