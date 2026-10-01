'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { formStyles as s } from '@/features/staff/form/Form'

export type LocaleKey = 'ru' | 'uz' | 'en'

export const LOCALES: { key: LocaleKey; label: string }[] = [
  { key: 'ru', label: 'RU' },
  { key: 'uz', label: 'UZ' },
  { key: 'en', label: 'EN' }
]

type Ctx = { active: LocaleKey; setActive: (key: LocaleKey) => void }

const LocaleTabsContext = createContext<Ctx | null>(null)

export function useLocaleTab(): [LocaleKey, (key: LocaleKey) => void] {
  const ctx = useContext(LocaleTabsContext)
  const [localActive, setLocalActive] = useState<LocaleKey>('ru')
  if (ctx) return [ctx.active, ctx.setActive]
  return [localActive, setLocalActive]
}

/** RU / UZ / EN switch. `filled` marks languages that already have text. */
export function LocaleSwitch({
  active,
  onChange,
  filled
}: {
  active: LocaleKey
  onChange: (key: LocaleKey) => void
  filled?: Partial<Record<LocaleKey, boolean>>
}) {
  return (
    <span className={s.tabs} role="tablist">
      {LOCALES.map(l => (
        <button
          key={l.key}
          type="button"
          role="tab"
          aria-selected={active === l.key}
          className={s.tab}
          data-on={active === l.key || undefined}
          data-filled={filled?.[l.key] || undefined}
          title={filled ? (filled[l.key] ? 'Заполнено' : 'Пусто') : undefined}
          onClick={() => onChange(l.key)}
        >
          {l.label}
        </button>
      ))}
    </span>
  )
}

// One switch for the whole form: flips every localized field at once, and
// stays in view while scrolling a long form.
export function LocaleTabsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<LocaleKey>('ru')

  return (
    <LocaleTabsContext.Provider value={{ active, setActive }}>
      <div className={s.langBar}>
        Язык полей
        <LocaleSwitch active={active} onChange={setActive} />
      </div>
      {children}
    </LocaleTabsContext.Provider>
  )
}
