'use client'

import { useState, useTransition } from 'react'
import { FormError, Section, formStyles as fs } from '@/features/staff/form/Form'
import a from './attendance.module.css'
import { useRouter } from 'next/navigation'
import { saveAttendance, markAllPresent } from '../attendanceActions'

type Status = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

// Same words and colors as the group journal.
const STATUS_LABELS: Record<Status, string> = {
  PRESENT: 'был',
  LATE: 'опоздал',
  ABSENT: 'пропустил',
  EXCUSED: 'по причине'
}

const AVATARS = ['var(--lv-a1-bg)', 'var(--lv-a2-bg)', 'var(--lv-b1-bg)', 'var(--lv-b2-bg)', 'var(--lv-c1-bg)', 'var(--c-butter)']

type Member = { userId: string; name: string; contact: string; status: Status | null }

export function AttendanceGrid({ eventId, members }: { eventId: string; members: Member[] }) {
  const [values, setValues] = useState<Record<string, Status | null>>(
    Object.fromEntries(members.map(m => [m.userId, m.status]))
  )
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const setStatus = (userId: string, status: Status) => {
    setValues(prev => ({ ...prev, [userId]: status }))
  }

  const save = () => {
    setError(null)
    const records = Object.entries(values)
      .filter((entry): entry is [string, Status] => entry[1] !== null)
      .map(([userId, status]) => ({ userId, status }))

    startTransition(async () => {
      const res = await saveAttendance(eventId, records)
      if (res.ok) router.refresh()
      else setError(res.error ?? 'Не получилось сохранить')
    })
  }

  const allPresent = () => {
    setError(null)
    startTransition(async () => {
      const res = await markAllPresent(eventId)
      if (res.ok) {
        setValues(prev => Object.fromEntries(Object.keys(prev).map(id => [id, 'PRESENT' as Status])))
        router.refresh()
      } else {
        setError(res.error ?? 'Не получилось')
      }
    })
  }

  if (members.length === 0) {
    return (
      <Section title="Посещаемость">
        <p className={fs.hint}>В группе пока нет учеников.</p>
      </Section>
    )
  }

  const marked = Object.values(values).filter(Boolean).length

  return (
    <Section
      title="Посещаемость"
      action={
        <button type="button" className={fs.sideBtn} onClick={allPresent} disabled={pending}>
          Все были
        </button>
      }
    >
      {error && <FormError>{error}</FormError>}

      <ul className={a.list}>
        {members.map((m, i) => (
          <li key={m.userId} className={a.row}>
            <span className={a.who}>
              <span className={a.avatar} style={{ background: AVATARS[i % AVATARS.length] }}>
                {m.name.charAt(0).toUpperCase()}
              </span>
              <span className={a.names}>
                <span className={a.name}>{m.name}</span>
                <span className={a.contact}>{m.contact}</span>
              </span>
            </span>
            <span className={a.marks} role="radiogroup" aria-label={m.name}>
              {(Object.keys(STATUS_LABELS) as Status[]).map(status => (
                <button
                  key={status}
                  type="button"
                  role="radio"
                  aria-checked={values[m.userId] === status}
                  className={a.mark}
                  data-status={status}
                  data-on={values[m.userId] === status || undefined}
                  onClick={() => setStatus(m.userId, status)}
                  disabled={pending}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>

      <div className={fs.actions}>
        <button type="button" className={fs.inlineSubmit} onClick={save} disabled={pending}>
          {pending ? 'Сохраняю…' : 'Сохранить посещаемость'}
        </button>
        <span className={fs.hint}>
          Отмечено {marked} из {members.length}
        </span>
      </div>
    </Section>
  )
}
