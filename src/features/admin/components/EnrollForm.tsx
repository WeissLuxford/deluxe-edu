'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { enrollUser } from '../actions'
import type { ActionResult } from '../actions'

type Option = { id: string; label: string }

export function EnrollForm({
  users,
  courses
}: {
  users: Option[]
  courses: Option[]
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    enrollUser,
    null
  )
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (state?.ok) {
      setDone(true)
      router.refresh()
    }
  }, [state, router])

  if (users.length === 0 || courses.length === 0) {
    return (
      <div className="card" style={{ padding: '1.5rem', color: 'var(--muted)' }}>
        {users.length === 0
          ? 'Пока нет ни одного зарегистрированного пользователя.'
          : 'Сначала создайте хотя бы один курс.'}
      </div>
    )
  }

  return (
    <form action={formAction} className="card" style={{ padding: '1.5rem' }}>
      <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
        Записать на курс
      </h3>

      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}
      {done && <div className="alert alert-success">Запись оформлена</div>}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label className="label">Студент</label>
          <select name="userId" className="select" required onChange={() => setDone(false)}>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Курс</label>
          <select name="courseId" className="select" required onChange={() => setDone(false)}>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Тариф</label>
          <select name="plan" className="select" defaultValue="BASIC">
            <option value="FREE">FREE</option>
            <option value="BASIC">BASIC</option>
            <option value="PRO">PRO</option>
            <option value="DELUXE">DELUXE</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ marginTop: '1.25rem' }} disabled={pending}>
        {pending ? 'Записываю…' : 'Записать'}
      </button>

      <div className="hint" style={{ marginTop: '0.75rem' }}>
        Ручная запись без оплаты. Если студент уже был записан, запись станет активной
        и тариф обновится.
      </div>
    </form>
  )
}
