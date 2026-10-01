'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { Field } from '@/design/components/Bits'
import s from './account.module.css'

type Props = { firstName: string; lastName: string; email: string; meta: string }

/** Name, a one-line summary and an inline editor that slides open under it. */
export function ProfileHead({ firstName, lastName, email, meta }: Props) {
  const t = useTranslations('accountPage')
  const router = useRouter()
  const { update } = useSession()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ firstName, lastName, email })
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const name = [firstName, lastName].filter(Boolean).join(' ') || '—'

  async function save(e: FormEvent) {
    e.preventDefault()
    setState('saving')
    const res = await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).catch(() => null)
    if (!res?.ok) return setState('error')
    await update().catch(() => {})
    setState('saved')
    router.refresh()
    setTimeout(() => setState('idle'), 2400)
  }

  return (
    <div className={s.head}>
      <div className={s.headRow}>
        <span className={s.avatar} aria-hidden="true">
          {(firstName || name).slice(0, 1).toUpperCase()}
        </span>
        <span className={s.headText}>
          <span className={s.name}>{name}</span>
          <span className={s.meta}>{meta}</span>
        </span>
        <Button variant="ghost" size="md" onClick={() => setOpen(v => !v)} aria-expanded={open}>
          {open ? t('close') : t('edit')}
        </Button>
      </div>
      <div className={[s.editor, open && s.editorOpen].filter(Boolean).join(' ')}>
        <div className={s.editorInner}>
          <form className={s.editorForm} onSubmit={save}>
            <Field label={t('firstName')} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} maxLength={100} required />
            <Field label={t('lastName')} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} maxLength={100} />
            <Field label={t('email')} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@mail.uz" />
            <span className={s.editorActions}>
              <Button type="submit" size="md" dot disabled={state === 'saving' || !form.firstName.trim()}>
                {state === 'saving' ? t('saving') : state === 'saved' ? t('saved') : t('save')}
              </Button>
              {state === 'error' && <span className={s.error}>{t('saveError')}</span>}
            </span>
          </form>
        </div>
      </div>
    </div>
  )
}
