'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveAttendance, markAllPresent } from '../attendanceActions'

type Status = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

const STATUS_LABELS: Record<Status, string> = {
  PRESENT: 'Был',
  ABSENT: 'Не был',
  LATE: 'Опоздал',
  EXCUSED: 'Уважительная'
}

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
      <section className="admin-card">
        <h3 className="admin-card__title">Посещаемость</h3>
        <div className="admin-empty">В группе пока нет студентов.</div>
      </section>
    )
  }

  return (
    <section className="admin-card">
      <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
        <h3 className="admin-card__title" style={{ marginBottom: 0 }}>
          Посещаемость
        </h3>
        <button type="button" className="btn btn-ghost" onClick={allPresent} disabled={pending}>
          Отметить всех «был»
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Студент</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.userId}>
                <td>
                  <span style={{ color: 'var(--fg)' }}>{m.name}</span>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {m.contact}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    {(Object.keys(STATUS_LABELS) as Status[]).map(status => (
                      <button
                        key={status}
                        type="button"
                        className={
                          values[m.userId] === status
                            ? 'badge badge-primary toggle-badge'
                            : 'badge toggle-badge'
                        }
                        onClick={() => setStatus(m.userId, status)}
                        disabled={pending}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                    {values[m.userId] == null && (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        не отмечено
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-savebar">
        <button type="button" className="btn btn-primary" onClick={save} disabled={pending}>
          {pending ? 'Сохраняю…' : 'Сохранить посещаемость'}
        </button>
      </div>
    </section>
  )
}
