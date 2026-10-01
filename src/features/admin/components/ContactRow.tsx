'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setContactStatus } from '../actions'
import { leadSource } from '../leadSources'
import { formatPhone } from '@/features/auth/identity'
import { ago } from '@/features/staff/format'

const STATUSES = [
  { value: 'NEW', label: 'Новая' },
  { value: 'CONTACTED', label: 'Связались' },
  { value: 'RESOLVED', label: 'Закрыта' },
  { value: 'SPAM', label: 'Спам' }
] as const

type Status = (typeof STATUSES)[number]['value']

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
  campaign,
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
  campaign: string | null
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

  const src = leadSource(source)

  return (
    <tr data-muted={current === 'SPAM' || undefined}>
      <td>
        <div style={{ fontWeight: 700 }}>{name}</div>
        {email && <div className="text-xs" style={{ color: 'var(--muted)' }}>{email}</div>}
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>
        <a href={`tel:+${phone}`} style={{ color: 'var(--t-link)', fontWeight: 600, textDecoration: 'none' }}>
          {formatPhone(phone)}
        </a>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>{LOCALES[locale] || locale.toUpperCase()}</div>
      </td>
      <td>
        <span className="badge" style={{ background: `var(--lv-${src.look}-bg)`, color: `var(--lv-${src.look}-fg)` }}>
          {src.label}
        </span>
        {campaign && <div className="text-xs" style={{ fontFamily: 'monospace', color: 'var(--muted)', marginTop: 4 }}>{campaign}</div>}
        {courseTitle && (
          <div className="text-xs" style={{ color: 'var(--muted)', marginTop: 4 }}>
            {courseTitle}
            {plan && ` · ${plan}`}
          </div>
        )}
      </td>
      <td style={{ maxWidth: '18rem', color: 'var(--muted)', fontSize: '0.9rem' }}>{message || '—'}</td>
      <td style={{ color: 'var(--muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{ago(new Date(createdAt))}</td>
      <td>
        <select className="select" value={current} disabled={pending} onChange={e => onChange(e.target.value as Status)} style={{ minWidth: '9rem' }}>
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
    </tr>
  )
}
