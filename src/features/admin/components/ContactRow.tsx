'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setContactStatus } from '../actions'

const STATUSES = [
  { value: 'NEW', label: 'Новая' },
  { value: 'CONTACTED', label: 'Связались' },
  { value: 'RESOLVED', label: 'Закрыта' },
  { value: 'SPAM', label: 'Спам' }
] as const

type Status = (typeof STATUSES)[number]['value']

const SOURCES: Record<string, string> = {
  HOME_FORM: 'Форма на главной',
  COURSE_PAGE: 'Страница курса',
  CONTACTS_PAGE: 'Страница контактов',
  TRIAL_LESSON: 'Пробный урок',
  LEVEL_TEST: 'Тест уровня'
}

const LOCALES: Record<string, string> = {
  ru: 'RU',
  uz: 'UZ',
  en: 'EN'
}

export function ContactRow({
  id,
  name,
  phone,
  email,
  message,
  createdAt,
  status,
  source,
  courseTitle,
  plan,
  locale
}: {
  id: string
  name: string
  phone: string
  email: string | null
  message: string | null
  createdAt: string
  status: string
  source: string
  courseTitle: string | null
  plan: string | null
  locale: string
}) {
  const router = useRouter()
  const [current, setCurrent] = useState<Status>(status as Status)
  const [pending, startTransition] = useTransition()

  const onChange = (next: Status) => {
    const previous = current
    setCurrent(next)
    startTransition(async () => {
      const res = await setContactStatus(id, next)
      if (res.ok) router.refresh()
      else setCurrent(previous)
    })
  }

  return (
    <tr style={{ opacity: current === 'SPAM' ? 0.5 : 1 }}>
      <td>
        <div style={{ color: 'var(--fg)' }}>{name}</div>
        {email && <div className="text-xs" style={{ color: 'var(--muted)' }}>{email}</div>}
      </td>
      <td>
        <a href={`tel:+${phone}`} style={{ color: 'var(--gold-text)' }}>+{phone}</a>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>{LOCALES[locale] || locale.toUpperCase()}</div>
      </td>
      <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
        <div style={{ color: 'var(--fg)' }}>{SOURCES[source] || source}</div>
        {courseTitle && (
          <div className="text-xs">
            {courseTitle}
            {plan && ` · ${plan}`}
          </div>
        )}
      </td>
      <td style={{ maxWidth: '18rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
        {message || '—'}
      </td>
      <td style={{ color: 'var(--muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
        {new Date(createdAt).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })}
      </td>
      <td>
        <select
          className="select"
          value={current}
          disabled={pending}
          onChange={e => onChange(e.target.value as Status)}
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </td>
    </tr>
  )
}
