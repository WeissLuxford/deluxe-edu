'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setUserRole } from '../actions'

type Role = 'STUDENT' | 'MENTOR' | 'ADMIN'

const LABELS: Record<Role, string> = {
  STUDENT: 'Студент',
  MENTOR: 'Преподаватель',
  ADMIN: 'Администратор'
}

export function RoleSelect({
  userId,
  role,
  name,
  self
}: {
  userId: string
  role: Role
  name: string
  self: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (self) {
    return (
      <div>
        <span className="badge badge-primary">{LABELS[role]}</span>
        <div className="text-xs" style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>это вы</div>
      </div>
    )
  }

  const onChange = (next: Role) => {
    if (next === role) return

    const question =
      next === 'ADMIN'
        ? `Выдать «${name}» полный доступ к админке? Администратор видит и меняет всё: курсы, уроки, заявки и роли.`
        : `Сменить роль «${name}» на «${LABELS[next]}»?`

    if (!window.confirm(question)) {
      router.refresh()
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await setUserRole(userId, next)
      if (result.ok) router.refresh()
      else setError(result.error ?? 'Не получилось')
    })
  }

  return (
    <div>
      <select
        className="input"
        value={role}
        disabled={pending}
        onChange={event => onChange(event.target.value as Role)}
        style={{ minWidth: '11rem' }}
      >
        {(Object.keys(LABELS) as Role[]).map(value => (
          <option key={value} value={value}>
            {LABELS[value]}
          </option>
        ))}
      </select>
      {error && <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>{error}</div>}
    </div>
  )
}
