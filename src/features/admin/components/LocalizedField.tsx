'use client'

import { useState } from 'react'
import { useLocaleTab } from './LocaleTabs'

type Localized = { ru?: string; uz?: string; en?: string }

const LOCALES = [
  { key: 'ru' as const, label: 'RU' },
  { key: 'uz' as const, label: 'UZ' },
  { key: 'en' as const, label: 'EN' }
]

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

  const set = (key: 'ru' | 'uz' | 'en', v: string) => {
    setValues(prev => ({ ...prev, [key]: v }))
    if (key === 'ru') onRuChange?.(v)
  }

  const current = values[active] ?? ''
  const Input: any = textarea ? 'textarea' : 'input'

  return (
    <div className="lf">
      <div className="lf__head">
        <label className="label">
          {label}
          {required && ' *'}
        </label>
        <div className="lf__tabs">
          {LOCALES.map(l => {
            const filled = (values[l.key] ?? '').trim().length > 0
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

      <Input
        className={textarea ? 'textarea' : 'input'}
        rows={textarea ? rows : undefined}
        value={current}
        maxLength={maxLength}
        required={required && active === 'ru'}
        onChange={(e: any) => set(active, e.target.value)}
      />

      <div className="lf__foot">
        {hint && <span className="hint">{hint}</span>}
        {maxLength && (
          <span className={`lf__count${current.length > maxLength * 0.9 ? ' warn' : ''}`}>
            {current.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
