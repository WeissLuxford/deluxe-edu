'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addMember } from '../groupActions'
import type { ActionResult } from '../types'

type Option = { id: string; label: string }

export function AddMemberForm({ groupId, students }: { groupId: string; students: Option[] }) {
  const router = useRouter()
  const action = addMember.bind(null, groupId)
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (state?.ok) {
      setDone(true)
      router.refresh()
    }
  }, [state, router])

  if (students.length === 0) {
    return (
      <div className="hint">
        Нет студентов, которых можно добавить — либо все уже в группе, либо студентов пока нет.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}
      {done && <div className="alert alert-success">Студент добавлен</div>}

      <select
        name="userId"
        className="select"
        required
        onChange={() => setDone(false)}
        style={{ minWidth: '16rem' }}
      >
        {students.map(s => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Добавляю…' : 'Добавить в группу'}
      </button>
    </form>
  )
}
