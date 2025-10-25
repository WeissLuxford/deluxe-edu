'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const t = useTranslations('common')
  const locale = useLocale()
  const search = useSearchParams()
  const next = search.get('next') || `/${locale}/dashboard`
  const error = search.get('error')
  const verified = search.get('verified')
  const verifyStatus = search.get('verify')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendOk, setResendOk] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', {
      action: 'signin',
      identifier,
      password,
      redirect: true,
      callbackUrl: next
    })
    setLoading(false)
  }

  const resendEmail = async () => {
    setLoading(true)
    const res = await fetch('/api/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier })
    })
    if (res.ok) setResendOk(true)
    setLoading(false)
  }

  return (
    <main className="auth-shell">
      <form onSubmit={handleSubmit} className="auth-card">
        <h1 className="auth-title">{t('signin.title')}</h1>

        {verified && <p className="auth-success">{t('auth.verified')}</p>}
        {verifyStatus === 'expired' && <p className="auth-error">{t('auth.expired')}</p>}
        {verifyStatus === 'invalid' && <p className="auth-error">{t('auth.invalid')}</p>}
        {verifyStatus === 'used' && <p className="auth-error">{t('auth.used')}</p>}
        {error && !verifyStatus && <p className="auth-error">{t('auth.error')}</p>}

        <input
          type="text"
          placeholder={t('signin.emailOrName')}
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          className="input"
          required
        />
        <input
          type="password"
          placeholder={t('signin.password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input"
          required
        />

        <button type="submit" className="iridescent vx w-full" disabled={loading}>
          {loading ? t('buttons.loading') : t('buttons.signIn')}
          <span className="drop-shadow" />
        </button>

        {!resendOk && verifyStatus === 'expired' && (
          <button type="button" onClick={resendEmail} disabled={loading} className="auth-link mt-2">
            {t('auth.resend')}
          </button>
        )}
        {resendOk && <p className="auth-success">{t('auth.resent')}</p>}

        <p className="auth-note">
          {t('signin.noAccount')}{' '}
          <Link
            href={`/${locale}/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="auth-link"
          >
            {t('buttons.signUp')}
          </Link>
        </p>
      </form>
    </main>
  )
}
