'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { enrollUser } from '../actions'
import type { ActionResult } from '../actions'
import { Chips, Field, FormError, FormOk, Row, Section, Select, Submit, formStyles as fs } from '@/features/staff/form/Form'

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
      <Section title="Открыть доступ к курсу">
        <p className={fs.hint}>{users.length === 0 ? 'Пока нет ни одного зарегистрированного пользователя.' : 'Сначала создай хотя бы один курс.'}</p>
      </Section>
    )
  }

  return (
    <form action={formAction}>
      <Section title="Открыть доступ к курсу" hint="Ручная запись без оплаты. Если ученик уже был записан, запись станет активной, а тариф обновится.">
        {state && !state.ok && <FormError>{state.error}</FormError>}
        {done && <FormOk>Готово — доступ открыт.</FormOk>}

        <Row min={240}>
          <Field label="Ученик" htmlFor="enroll-user">
            <Select id="enroll-user" name="userId" required onChange={() => setDone(false)}>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Курс" htmlFor="enroll-course">
            <Select id="enroll-course" name="courseId" required onChange={() => setDone(false)}>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </Row>

        <Field label="Тариф">
          <Chips
            name="plan"
            defaultValue="BASIC"
            options={[
              { value: 'FREE', label: 'Free' },
              { value: 'BASIC', label: 'Basic' },
              { value: 'PRO', label: 'Pro' },
              { value: 'DELUXE', label: 'Deluxe' }
            ]}
          />
        </Field>

        <Submit pending={pending} label="Открыть доступ" pendingLabel="Открываю…" />
      </Section>
    </form>
  )
}
