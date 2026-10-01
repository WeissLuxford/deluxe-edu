'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ActionButton } from '@/features/teacher/components/ActionButton'
import type { ActionResult } from './actions'

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
        <form action={formAction} style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
          <label className="label" htmlFor="cert-course">Курс</label>
          <select id="cert-course" name="courseId" className="select">
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <label className="label" htmlFor="cert-level">Уровень в документе</label>
          <input
            id="cert-level"
            name="level"
            className="input"
            defaultValue={courses[0]?.level ?? ''}
            maxLength={60}
            placeholder="Например, B1 Intermediate"
          />

          <label className="label" htmlFor="cert-note">Примечание (не показывается публично)</label>
          <input id="cert-note" name="note" className="input" maxLength={300} />

          <button type="submit" className="btn btn-primary" disabled={pending} style={{ justifySelf: 'start' }}>
            {pending ? 'Выдаю…' : 'Выдать сертификат'}
          </button>

          {state && (
            <div className={state.ok ? 'alert' : 'alert alert-error'}>
              {state.ok ? `Выдан номер ${state.error}` : state.error}
            </div>
          )}
        </form>
      )}
    </section>
  )
}
