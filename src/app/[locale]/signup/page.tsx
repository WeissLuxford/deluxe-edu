'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const passwordOk = (s: string) => /^(?=.*[A-Za-z])(?=.*\d).+$/.test(s)

export default function SignUpPage() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const search = useSearchParams()
  
  // 🔍 DEBUG - смотрим что за locale
  console.log('🔍 Locale:', locale)
  
  // 👈 ИСПРАВЛЕНО: проверяем что locale валидный
  const validLocale = ['ru', 'uz', 'en'].includes(locale) ? locale : 'ru'
  const next = search.get('next') || `/${validLocale}/dashboard`
  
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit =
    email.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    displayName.trim() &&
    passwordOk(password) &&
    password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    
    setLoading(true)
    setError('')
    
    console.log('🚀 Starting signup with next:', next)
    
    const result = await signIn('credentials', {
      action: 'signup',
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      displayName,
      redirect: false
    })
    
    console.log('📦 Signup result:', result)
    
    setLoading(false)
    
    if (result?.error) {
      console.error('❌ Signup error:', result.error)
      setError(result.error === 'CredentialsSignin' ? t('auth.signupFailed') : result.error)
      return
    }
    
    if (result?.ok) {
      console.log('✅ Signup successful, redirecting to:', next)
      router.push(next)
      router.refresh()
    } else {
      console.error('❌ Signup failed without error')
      setError(t('auth.signupFailed'))
    }
  }

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword
  const weak = password.length > 0 && !passwordOk(password)

  return (
    <main className="auth-shell">
      <form onSubmit={handleSubmit} className="auth-card">
        <h1 className="auth-title">{t('signup.title')}</h1>
        
        {error && (
          <div className="auth-error bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <input
          type="email"
          placeholder={t('signup.email')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input"
          required
        />
        <div className="auth-grid2">
          <input
            type="text"
            placeholder={t('signup.firstName')}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder={t('signup.lastName')}
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="input"
            required
          />
        </div>
        <input
          type="text"
          placeholder={t('signup.displayName')}
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="input"
          required
        />
        <input
          type="password"
          placeholder={t('signup.password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input"
          required
        />
        {weak && <p className="auth-hint">{t('auth.passwordHint')}</p>}
        <input
          type="password"
          placeholder={t('signup.confirmPassword')}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="input"
          required
        />
        {mismatch && <p className="auth-error">{t('auth.mismatch')}</p>}
        <button
          type="submit"
          className="iridescent vx w-full"
          disabled={loading || !canSubmit}
        >
          {loading ? t('buttons.loading') : t('buttons.signUp')}
          <span className="drop-shadow" />
        </button>
        <p className="auth-note">
          {t('signup.haveAccount')}{' '}
          <Link href={`/${validLocale}/signin${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="auth-link">
            {t('buttons.signIn')}
          </Link>
        </p>
      </form>
    </main>
  )
}
