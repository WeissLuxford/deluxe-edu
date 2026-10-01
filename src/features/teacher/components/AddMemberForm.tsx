'use client'

import { useActionState, useEffect, useState } from 'react'
import { FormError, FormOk, Select, Submit, formStyles as fs } from '@/features/staff/form/Form'
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
    return <p className={fs.hint}>Добавить некого — все ученики уже в группе или их пока нет.</p>
  }

  return (
    <form action={formAction} className={fs.stack}>
      {state && !state.ok && <FormError>{state.error}</FormError>}
      {done && <FormOk>Ученик добавлен</FormOk>}
      <div className={fs.withButton}>
        <Select name="userId" required onChange={() => setDone(false)} aria-label="Ученик">
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <Submit pending={pending} label="Добавить в группу" pendingLabel="Добавляю…" />
      </div>
    </form>
  )
}
