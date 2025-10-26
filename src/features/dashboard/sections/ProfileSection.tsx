'use client'

import { useState } from 'react'
import UserAvatar from '../UserAvatar'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  locale: string
  createdAt: string | Date
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  emailVerified?: string | Date | null
  passwordTail?: string | null
}

export default function ProfileSection({ user }: { user: User }) {
  const t = useTranslations('common')
  const locale = useLocale()
  const [displayName, setDisplayName] = useState(user.name || '')
  const [firstName, setFirstName] = useState(user.firstName || '')
  const [lastName, setLastName] = useState(user.lastName || '')
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [emailChanged, setEmailChanged] = useState(false)

  const canSave =
    displayName.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    email.trim()

const [err, setErr] = useState<string | null>(null)

const onSave = async () => {
  if (!canSave || saving) return
  setSaving(true)
  setSaved(false)
  setEmailChanged(false)
  setErr(null)
  try {
    const r = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, firstName, lastName, email, phone, locale })
    })
    const json = await r.json()
    if (!r.ok || !json.ok) {
      if (json?.error === 'email_taken') setErr('emailTaken')
      else if (json?.error === 'server') setErr('server')
      else setErr('saveFailed')
      return
    }
    setSaved(true)
    const nextName = displayName?.trim() || [firstName, lastName].filter(Boolean).join(' ').trim() || ''
    const nextEmail = email.trim()
    if (typeof window !== 'undefined') {
      const payload = { name: nextName, email: nextEmail }
      window.dispatchEvent(new CustomEvent('vertex:user-updated', { detail: payload }))
      sessionStorage.setItem('vertexUserOverride', JSON.stringify(payload))
    }
    setEmailChanged(Boolean(json.emailChanged))
  } catch {
    setErr('server')
  } finally {
    setSaving(false)
  }
}



  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const joined = new Date(user.createdAt).toLocaleDateString(locale)
  const verified = Boolean(user.emailVerified)
  const tail = user.passwordTail || '••••'

  return (
    <section className="card">
      <div className="flex items-center gap-4">
        <UserAvatar src={user.image || undefined} name={user.name} email={user.email} size={72} />
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">{displayName || user.email}</div>
          {fullName ? (
            <div className="text-sm text-muted truncate">{fullName}</div>
          ) : (
            <div className="text-sm text-muted truncate">{user.email}</div>
          )}
        </div>
      </div>

      <div className="divider" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="label">{t('profile.displayName')}</div>
          <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>
        <div>
          <div className="label">{t('profile.role')}</div>
          <input className="input" value={user.role} disabled />
        </div>
        <div>
          <div className="label">{t('profile.firstName')}</div>
          <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div>
          <div className="label">{t('profile.lastName')}</div>
          <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <div className="label">{t('profile.email')}</div>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          {!verified && (
            <div className="mt-2 text-sm">
              <span className="text-muted">{t('profile.emailNotVerified')}</span>{' '}
              <Link href={`/${locale}/resend-verification`} className="auth-link underline hover:no-underline">
                {t('auth.resend')}
              </Link>
            </div>
          )}
          {emailChanged && (
            <div className="mt-2 text-sm text-gold">{t('profile.emailChanged')}</div>
          )}
        </div>
        <div>
          <div className="label">{t('profile.phone')}</div>
          <input className="input" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998..." />
        </div>
        <div>
          <div className="label">{t('profile.passwordTail')}</div>
          <input className="input" value={`**** **** **** ${tail}`} disabled />
        </div>
        <div>
          <div className="label">{t('profile.locale')}</div>
          <input className="input" value={user.locale} disabled />
        </div>
        <div>
          <div className="label">{t('profile.joined')}</div>
          <input className="input" value={joined} disabled />
        </div>
      </div>

      <div className="divider" />

      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={onSave} disabled={!canSave || saving}>
          {saving ? t('buttons.saving') : t('profile.save')}
        </button>
        {saved && <span className="text-sm text-gold">{t('profile.saved')}</span>}
        {err && <span className="text-sm text-red-500">{t(`errors.${err}`)}</span>}
      </div>

    </section>
  )
}
