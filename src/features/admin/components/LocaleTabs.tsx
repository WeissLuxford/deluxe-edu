'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

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

export function LocaleTabsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<LocaleKey>('ru')

  return (
    <LocaleTabsContext.Provider value={{ active, setActive }}>
      <div className="lf-global">
        <span className="lf-global__label">Язык полей</span>
        <div className="lf__tabs">
          {LOCALES.map(l => (
            <button
              key={l.key}
              type="button"
              className={`lf__tab${active === l.key ? ' active' : ''}`}
              onClick={() => setActive(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      {children}
    </LocaleTabsContext.Provider>
  )
}
