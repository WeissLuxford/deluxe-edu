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

export function ContactRow({
  id,
  name,
  phone,
  email,
  message,
  createdAt,
  status
}: {
  id: string
  name: string
  phone: string
  email: string | null
  message: string | null
  createdAt: string
  status: string
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
      </td>
      <td style={{ maxWidth: '22rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
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
