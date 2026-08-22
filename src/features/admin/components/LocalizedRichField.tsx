'use client'

import { useState } from 'react'
import { useLocaleTab } from './LocaleTabs'
import { RichTextEditor } from './RichTextEditor'

type Localized = { ru?: string; uz?: string; en?: string }

const LOCALES = [
  { key: 'ru' as const, label: 'RU' },
  { key: 'uz' as const, label: 'UZ' },
  { key: 'en' as const, label: 'EN' }
]

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

  const set = (key: 'ru' | 'uz' | 'en', html: string) => {
    setValues(prev => ({ ...prev, [key]: html }))
  }

  return (
    <div className="lf">
      <div className="lf__head">
        <label className="label">
          {label}
          {required && ' *'}
        </label>
        <div className="lf__tabs">
          {LOCALES.map(l => {
            const filled = (values[l.key] ?? '').replace(/<[^>]*>/g, '').trim().length > 0
            return (
              <button
                key={l.key}
                type="button"
                className={`lf__tab${active === l.key ? ' active' : ''}${filled ? ' filled' : ''}`}
                onClick={() => setActive(l.key)}
                title={filled ? 'Заполнено' : 'Пусто'}
              >
                {l.label}
              </button>
            )
          })}
        </div>
      </div>

      {LOCALES.map(l => (
        <input key={l.key} type="hidden" name={`${name}_${l.key}`} value={values[l.key] ?? ''} />
      ))}

      <RichTextEditor value={values[active] ?? ''} onChange={html => set(active, html)} />

      {hint && (
        <div className="lf__foot">
          <span className="hint">{hint}</span>
        </div>
      )}
    </div>
  )
}
