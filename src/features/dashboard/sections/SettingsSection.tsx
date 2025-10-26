'use client'

import { useState } from 'react'

export default function SettingsSection({ user }: { user: { locale: string } }) {
  const [lang, setLang] = useState(user.locale || 'ru')
  const [saving, setSaving] = useState(false)
  const onSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/me', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ locale: lang }) })
    } finally {
      setSaving(false)
    }
  }
  return (
    <section className="card">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="label">Язык интерфейса</div>
          <select className="select" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="ru">RU</option>
            <option value="uz">UZ</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
      <div className="divider" />
      <button className="btn btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Сохранение' : 'Сохранить'}</button>
    </section>
  )
}
