'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { User, Mail, Send } from 'lucide-react'
import PhoneField, { isPhoneComplete } from '@/features/auth/components/PhoneField'
import { PHONE_PREFIX, normalizePhone } from '@/features/auth/identity'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'

export type LeadSource = 'HOME_FORM' | 'COURSE_PAGE' | 'CONTACTS_PAGE' | 'TRIAL_LESSON' | 'LEVEL_TEST'

type LeadFormProps = {
  source: LeadSource
  courseId?: string
  plan?: string
  withEmail?: boolean
  onSent?: () => void
}

export default function LeadForm({ source, courseId, plan, withEmail = true, onSent }: LeadFormProps) {
  const t = useTranslations('lead')
  const locale = useLocale()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const captchaReady = !turnstileEnabled() || Boolean(turnstileToken)
  const ready =
    firstName.trim().length > 0 && lastName.trim().length > 0 && isPhoneComplete(phone) && captchaReady

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return

    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: normalizePhone(phone),
          email: email.trim() || undefined,
          source,
          courseId,
          plan,
          locale,
          turnstileToken
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(t(`errors.${data.error || 'server'}`))
        setStatus('error')
        return
      }

      setStatus('sent')
      onSent?.()
    } catch {
      setError(t('errors.network'))
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div
        className="alert alert-success"
        style={{ padding: '1.25rem', borderRadius: 'var(--radius)', textAlign: 'center' }}
      >
        <strong style={{ display: 'block', marginBottom: '0.35rem' }}>{t('sent')}</strong>
        <span style={{ color: 'var(--muted)' }}>{t('sentHint')}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="auth-grid2">
        <div>
          <label htmlFor="lead-first" className="label">
            {t('firstName')}
          </label>
          <div style={{ position: 'relative' }}>
            <User
              size={20}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              id="lead-first"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="input"
              style={{ paddingLeft: '3rem' }}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="lead-last" className="label">
            {t('lastName')}
          </label>
          <div style={{ position: 'relative' }}>
            <User
              size={20}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              id="lead-last"
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="input"
              style={{ paddingLeft: '3rem' }}
              required
            />
          </div>
        </div>
      </div>

      <PhoneField value={phone} onChange={setPhone} label={t('phone')} id="lead-phone" />

      {withEmail && (
        <div>
          <label htmlFor="lead-email" className="label">
            {t('emailOptional')}
          </label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={20}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              style={{ paddingLeft: '3rem' }}
              placeholder="name@example.com"
            />
          </div>
        </div>
      )}

      <Turnstile onToken={setTurnstileToken} />

      {status === 'error' && (
        <p
          className="auth-error"
          style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)' }}
        >
          {error}
        </p>
      )}

      <button type="submit" className="iridescent vx w-full" disabled={status === 'loading' || !ready}>
        {status === 'loading' ? t('sending') : t('submit')}
        <span className="drop-shadow" />
      </button>

      <p className="auth-hint" style={{ textAlign: 'center' }}>
        {t('noAccountNeeded')}
      </p>
    </form>
  )
}
