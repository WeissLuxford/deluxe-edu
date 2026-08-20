'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function LanguageField({ user }: { user: { locale: string } }) {
  const t = useTranslations('dashboard')
  const [lang, setLang] = useState(user.locale || 'ru')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const onSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: lang })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="label">{t('settingsLanguage')}</div>
          <select className="select" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="ru">RU</option>
            <option value="uz">UZ</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
      <div className="divider" />
      <button className="btn btn-primary" onClick={onSave} disabled={saving}>
        {saving ? t('settingsSaving') : t('settingsSave')}
      </button>
      {saved && <div className="alert alert-success" style={{ marginTop: '0.75rem' }}>{t('settingsSaved')}</div>}
    </div>
  )
}
