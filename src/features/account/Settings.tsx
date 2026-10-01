'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Segmented } from '@/design/components/Segmented'
import { chooseTheme, useTheme, type Theme } from '@/design/layout/theme'
import { revokeOwnDevice } from '@/features/dashboard/deviceActions'
import s from './account.module.css'

export type SettingRow = { id: string; label: string; value: string; content: ReactNode }

/** Settings as a single list; each row opens its panel in place. */
export function SettingsList({ rows }: { rows: SettingRow[] }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className={s.settings}>
      {rows.map(row => {
        const on = open === row.id
        return (
          <div key={row.id} className={[s.setting, on && s.settingOpen].filter(Boolean).join(' ')}>
            <button type="button" className={s.settingHead} aria-expanded={on} onClick={() => setOpen(on ? null : row.id)}>
              <span>{row.label}</span>
              <span className={s.settingValue}>
                {row.value}
                <span className={s.chev} aria-hidden="true">›</span>
              </span>
            </button>
            <div className={s.settingBody}>
              <div className={s.settingInner}>
                <div className={s.settingContent}>{row.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Light or dark, applied instantly and remembered on this device. */
export function ThemeChoice() {
  const t = useTranslations('accountPage')
  const theme = useTheme()
  return (
    <Segmented<Theme>
      label={t('settings.theme')}
      value={theme}
      onChange={chooseTheme}
      tone="white"
      options={(['light', 'dark'] as Theme[]).map(v => ({ value: v, label: t(`themes.${v}`) }))}
    />
  )
}

/** Saves the language to the profile and switches the page to it. */
export function LanguageChoice({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname() || ''
  const [value, setValue] = useState(current)
  const pick = async (next: string) => {
    setValue(next)
    await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale: next }) }).catch(() => {})
    const parts = pathname.split('/')
    parts[1] = next
    router.push(parts.join('/'))
  }
  return (
    <Segmented<string>
      label="Language"
      value={value}
      onChange={pick}
      tone="white"
      options={[
        { value: 'ru', label: 'Русский' },
        { value: 'uz', label: 'O‘zbekcha' },
        { value: 'en', label: 'English' }
      ]}
    />
  )
}

type Device = { id: string; name: string; meta: string; current: boolean }

export function DevicesList({ devices, locale }: { devices: Device[]; locale: string }) {
  const t = useTranslations('accountPage')
  const router = useRouter()
  const [pending, start] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  if (devices.length === 0) return <p className={s.muted}>{t('noDevices')}</p>

  const revoke = (id: string) => {
    if (!window.confirm(t('revokeConfirm'))) return
    setBusyId(id)
    start(async () => {
      await revokeOwnDevice(id, locale)
      router.refresh()
    })
  }

  return (
    <ul className={s.list}>
      {devices.map(d => (
        <li key={d.id} className={s.item}>
          <span className={s.itemText}>
            <span className={s.itemTitle}>{d.name}</span>
            <span className={s.itemMeta}>{d.meta}</span>
          </span>
          {d.current ? (
            <span className={s.pill}>{t('thisDevice')}</span>
          ) : (
            <button type="button" className={s.linkBtn} onClick={() => revoke(d.id)} disabled={pending && busyId === d.id}>
              {pending && busyId === d.id ? '…' : t('revoke')}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
