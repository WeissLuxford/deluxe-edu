'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Phone, Lock } from 'lucide-react'

export default function SignInPage() {
  const t = useTranslations('signin')
  const locale = useLocale()
  const search = useSearchParams()
  const validLocale = ['ru', 'uz', 'en'].includes(locale) ? locale : 'ru'

  const requestedNext = search.get('next')

  const [phone, setPhone] = useState('+998 ')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPhone = (value: string) => {
    let digits = value.replace(/\D/g, '')
    if (digits.startsWith('998')) {
      digits = digits.slice(3, 12)
    } else if (digits.length > 0) {
      digits = digits.slice(0, 9)
    }
    if (digits.length === 0) return '+998 '
    if (digits.length <= 2) return `+998 ${digits}`
    if (digits.length <= 5) return `+998 ${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length < 5) {
      setPhone('+998 ')
      return
    }
    setPhone(formatPhone(value))
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && phone === '+998 ') {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const cleanPhone = phone.replace(/\D/g, '')

    const res = await signIn('credentials', {
      action: 'signin',
      phone: cleanPhone,
      password,
      redirect: false
    })

    if (!res?.ok) {
      setError(t('wrongCredentials'))
      setLoading(false)
      return
    }

    const session = await getSession()
    const isAdmin = session?.user?.role === 'ADMIN'
    const destination =
      requestedNext || (isAdmin ? `/${validLocale}/admin` : `/${validLocale}/learn`)

    window.location.href = destination
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
          <label className="label">{t('phone')}</label>
          <div style={{ position: 'relative' }}>
            <Phone
              size={20}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              type="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              className="input"
              style={{ paddingLeft: '3rem', fontSize: '1rem', letterSpacing: '0.02em' }}
              autoFocus
              required
            />
          </div>
        </div>

        <div>
          <label className="label">{t('password')}</label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={20}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
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
