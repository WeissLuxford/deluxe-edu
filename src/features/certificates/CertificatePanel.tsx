'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ActionButton } from '@/features/teacher/components/ActionButton'
import type { ActionResult } from './actions'
import { Field, FormError, FormOk, Input, Select, Submit, formStyles as fs } from '@/features/staff/form/Form'

export type AdminCertificate = {
  id: string
  serial: string
  courseTitle: string
  level: string
  issuedAt: string
  revokedAt: string | null
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function CertificatePanel({
  certificates,
  courses,
  issue,
  revoke
}: {
  certificates: AdminCertificate[]
  courses: { id: string; title: string; level: string }[]
  issue: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  revoke: (id: string) => Promise<ActionResult>
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(issue, null)

  useEffect(() => {
    if (state?.ok) router.refresh()
  }, [state, router])

  return (
    <section className="admin-card">
      <h3 className="admin-card__title">Сертификаты ({certificates.length})</h3>

      {certificates.length === 0 ? (
        <p className="admin-empty">Сертификатов нет.</p>
      ) : (
        <ul className="admin-feed">
          {certificates.map(cert => (
            <li key={cert.id}>
              <span>
                <strong className="doc-serial">{cert.serial}</strong>
                <span>
                  {cert.courseTitle} · {cert.level}
                  {cert.revokedAt && ` · аннулирован ${dateFmt.format(new Date(cert.revokedAt))}`}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <time>{dateFmt.format(new Date(cert.issuedAt))}</time>
                <ActionButton action={() => revoke(cert.id)} className="btn btn-ghost btn-sm">
                  {cert.revokedAt ? 'Вернуть' : 'Аннулировать'}
                </ActionButton>
              </span>
            </li>
          ))}
        </ul>
      )}

      {courses.length === 0 ? (
        <p className="admin-empty" style={{ marginTop: '0.75rem' }}>
          У ученика нет записей на курсы — сертификат выдавать не за что.
        </p>
      ) : (
        <form action={formAction} className={fs.stack} style={{ marginTop: 16 }}>
          <Field label="Курс" htmlFor="cert-course">
            <Select id="cert-course" name="courseId">
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Уровень в документе" htmlFor="cert-level">
            <Input id="cert-level" name="level" defaultValue={courses[0]?.level ?? ''} maxLength={60} placeholder="Например, B1 Intermediate" />
          </Field>
          <Field label="Примечание" htmlFor="cert-note" hint="Видно только в админке">
            <Input id="cert-note" name="note" maxLength={300} />
          </Field>
          <Submit pending={pending} label="Выдать сертификат" pendingLabel="Выдаю…" />
          {state && (state.ok ? <FormOk>Выдан номер {state.error}</FormOk> : <FormError>{state.error}</FormError>)}
        </form>
      )}
    </section>
  )
}
