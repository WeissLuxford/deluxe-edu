'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AtSign, Lock } from 'lucide-react'
import { safeNext } from '@/features/auth/identity'
import GoogleButton, { googleEnabled } from '@/features/auth/components/GoogleButton'

export default function SignInPage() {
  const t = useTranslations('signin')
  const tErrors = useTranslations('authErrors')
  const tMethod = useTranslations('authMethod')
  const locale = useLocale()
  const search = useSearchParams()
  const validLocale = ['ru', 'uz', 'en'].includes(locale) ? locale : 'ru'

  const requestedNext = search.get('next')

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const providerError = search.get('error')
  const knownProviderError =
    providerError === 'google_unverified' || providerError === 'link_required' ? providerError : null

  const [error, setError] = useState<string | null>(knownProviderError ? tErrors(knownProviderError) : null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', {
      identifier: identifier.trim(),
      password,
      redirect: false
    })

    if (!res?.ok) {
      const code = res?.error === 'rate_limited' || res?.error === 'email_unverified' ? res.error : null
      setError(code ? tErrors(code) : t('wrongCredentials'))
      setLoading(false)
      return
    }

    const session = await getSession()
    const isAdmin = session?.user?.role === 'ADMIN'
    const fallback = isAdmin ? 'admin' : 'learn'

    window.location.href = safeNext(requestedNext, validLocale, fallback)
  }

  return (
    <main className="auth-shell">
      <form onSubmit={handleSubmit} className="auth-card">
        <h1 className="auth-title">{t('title')}</h1>

        {error && (
          <p
            className="auth-error"
            style={{
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              padding: '0.75rem',
              borderRadius: 'var(--radius)'
            }}
          >
            {error}
          </p>
        )}

        <div>
          <label className="label" htmlFor="identifier">{t('identifier')}</label>
          <div style={{ position: 'relative' }}>
            <AtSign
              size={20}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              id="identifier"
              type="text"
              placeholder={t('identifierPlaceholder')}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="input"
              style={{ paddingLeft: '3rem' }}
              autoFocus
              required
            />
          </div>
          <p className="auth-hint" style={{ marginTop: '0.5rem' }}>{t('identifierHint')}</p>
        </div>

        <div>
          <label className="label" htmlFor="password">{t('password')}</label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={20}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              style={{ paddingLeft: '3rem' }}
              required
            />
          </div>
        </div>

        <button type="submit" className="iridescent vx w-full" disabled={loading}>
          {loading ? t('submitting') : t('submit')}
          <span className="drop-shadow" />
        </button>

        {googleEnabled() && (
          <>
            <p className="auth-hint" style={{ textAlign: 'center' }}>{tMethod('or')}</p>
            <GoogleButton callbackUrl={safeNext(requestedNext, validLocale)} />
          </>
        )}

        <p className="auth-note">
          <Link href={`/${validLocale}/forgot-password`} className="auth-link">
            {t('forgot')}
          </Link>
        </p>

        <p className="auth-note">
          {t('noAccount')}{' '}
          <Link
            href={`/${validLocale}/signup${requestedNext ? `?next=${encodeURIComponent(requestedNext)}` : ''}`}
            className="auth-link"
          >
            {t('signUp')}
          </Link>
        </p>
      </form>
    </main>
  )
}
