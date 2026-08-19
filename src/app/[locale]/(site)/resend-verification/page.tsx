'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'

export default function ResendVerificationPage() {
  const t = useTranslations('auth')
  const tSignup = useTranslations('signup')
  const tErrors = useTranslations('authErrors')
  const tForgot = useTranslations('forgot')
  const locale = useLocale()
  const validLocale = ['ru', 'uz', 'en'].includes(locale) ? locale : 'ru'

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const captchaReady = !turnstileEnabled() || Boolean(turnstileToken)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')

    const res = await fetch('/api/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), turnstileToken })
    }).catch(() => null)

    if (!res) {
      setError(tErrors('network'))
      setStatus('error')
      return
    }

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(tErrors(data.error || 'server'))
      setStatus('error')
      return
    }

    if (data.delivered === false) {
      setError(tSignup('verifyEmailFailed'))
      setStatus('error')
      return
    }

    setStatus('sent')
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">{t('resend')}</h1>

        {status === 'sent' ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="alert alert-success" style={{ padding: '1rem', borderRadius: 'var(--radius)' }}>
              {t('resent')}
            </div>
            <Link href={`/${validLocale}/signin`} className="auth-link" style={{ textAlign: 'center' }}>
              {tForgot('back')}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'grid', gap: '1.25rem' }}>
            {error && (
              <p
                className="auth-error"
                style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)' }}
              >
                {error}
              </p>
            )}

            <div>
              <label className="label" htmlFor="email">{tSignup('emailLabel')}</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={20}
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '3rem' }}
                  placeholder="name@example.com"
                  autoFocus
                  required
                />
              </div>
            </div>

            <Turnstile onToken={setTurnstileToken} />

            <button
              type="submit"
              className="iridescent vx w-full"
              disabled={status === 'loading' || !captchaReady}
            >
              {status === 'loading' ? tSignup('sending') : t('resend')}
              <span className="drop-shadow" />
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
