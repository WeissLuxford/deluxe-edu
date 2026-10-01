'use client'

import { useState } from 'react'
import { Field } from '@/features/staff/form/Form'
import { LOCALES, LocaleSwitch, useLocaleTab, type LocaleKey } from './LocaleTabs'
import { RichTextEditor } from './RichTextEditor'

type Localized = { ru?: string; uz?: string; en?: string }

// Тот же контракт FormData, что у LocalizedField (`${name}_ru` и т. д.),
// поэтому существующие server actions (readLocalized) читают это поле, не
// зная, что за ним теперь редактор, а не textarea.
export function LocalizedRichField({
  name,
  label,
  value,
  required = false,
  hint
}: {
  name: string
  label: string
  value: Localized
  required?: boolean
  hint?: string
}) {
  const [active, setActive] = useLocaleTab()
  const [values, setValues] = useState<Localized>({
    ru: value.ru ?? '',
    uz: value.uz ?? '',
    en: value.en ?? ''
  })

  const set = (key: LocaleKey, html: string) => {
    setValues(prev => ({ ...prev, [key]: html }))
  }

  const filled = Object.fromEntries(LOCALES.map(l => [l.key, (values[l.key] ?? '').replace(/<[^>]*>/g, '').trim().length > 0]))

  return (
    <Field label={label} required={required} hint={hint} extra={<LocaleSwitch active={active} onChange={setActive} filled={filled} />}>
      {LOCALES.map(l => (
        <input key={l.key} type="hidden" name={`${name}_${l.key}`} value={values[l.key] ?? ''} />
      ))}
      <RichTextEditor value={values[active] ?? ''} onChange={html => set(active, html)} />
    </Field>
  )
}
