'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import PhoneField, { isPhoneComplete } from '@/features/auth/components/PhoneField'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'
import { PHONE_PREFIX, normalizePhone } from '@/features/auth/identity'
import { PASSWORD_PATTERN } from '@/features/auth/password'
import { PasswordFields } from '@/features/auth/components/AccountFields'
import { emailSignupEnabled } from '@/features/auth/flags'

type Tab = 'phone' | 'email'
type Step = 'request' | 'code' | 'password' | 'emailSent'

export default function ForgotPasswordPage() {
  const t = useTranslations('forgot')
  const tSignup = useTranslations('signup')
  const tErrors = useTranslations('authErrors')
  const locale = useLocale()
  const router = useRouter()
  const validLocale = ['ru', 'uz', 'en'].includes(locale) ? locale : 'ru'

  const [tab, setTab] = useState<Tab>('phone')
  const [step, setStep] = useState<Step>('request')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [ticket, setTicket] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const captchaReady = !turnstileEnabled() || Boolean(turnstileToken)
  const passwordOk = PASSWORD_PATTERN.test(password)

  const show = (key: string) => {
    setError(tErrors(key))
    setLoading(false)
  }

  const startCooldown = () => {
    setCooldown(60)
    const timer = setInterval(() => {
      setCooldown(value => {
        if (value <= 1) {
          clearInterval(timer)
          return 0
        }
        return value - 1
      })
    }, 1000)
  }

  const requestPhoneCode = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/phone/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizePhone(phone), purpose: 'RESET', turnstileToken })
    }).catch(() => null)

    if (!res) return show('network')

    const data = await res.json().catch(() => ({}))
    if (!res.ok) return show(data.error || 'server')

    startCooldown()
    setStep('code')
    setLoading(false)
  }

  const submitCode = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/phone/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizePhone(phone), purpose: 'RESET', code })
    }).catch(() => null)

    if (!res) return show('network')

    const data = await res.json().catch(() => ({}))
    if (!res.ok) return show(data.error || 'server')

    setTicket(data.ticket)
    setStep('password')
    setLoading(false)
  }

  const requestEmailLink = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/password/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), turnstileToken })
    }).catch(() => null)

    if (!res) return show('network')

    const data = await res.json().catch(() => ({}))
    if (!res.ok) return show(data.error || 'server')

    setStep('emailSent')
    setLoading(false)
  }

  const savePassword = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, password, confirm })
    }).catch(() => null)

    if (!res) return show('network')

    const data = await res.json().catch(() => ({}))
    if (!res.ok) return show(data.error || 'server')

    const result = await signIn('credentials', {
      identifier: data.identifier,
      password,
      redirect: false
    })

    setLoading(false)

    if (result?.ok) {
      router.push(`/${validLocale}/learn`)
      router.refresh()
      return
    }

    router.push(`/${validLocale}/signin`)
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">{t('title')}</h1>

        {error && (
          <p
            className="auth-error"
            style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)' }}
          >
            {error}
          </p>
        )}

        {step === 'request' && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <p className="auth-hint">{t('lead')}</p>

            {emailSignupEnabled() && (
              <div className="auth-grid2">
                <button
                  type="button"
                  className={tab === 'phone' ? 'iridescent vx w-full' : 'btn-ghost'}
                  onClick={() => setTab('phone')}
                >
                  {t('byPhone')}
                  {tab === 'phone' && <span className="drop-shadow" />}
                </button>
                <button
                  type="button"
                  className={tab === 'email' ? 'iridescent vx w-full' : 'btn-ghost'}
                  onClick={() => setTab('email')}
                >
                  {t('byEmail')}
                  {tab === 'email' && <span className="drop-shadow" />}
                </button>
              </div>
            )}

            {tab === 'phone' ? (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  requestPhoneCode()
                }}
                style={{ display: 'grid', gap: '1.25rem' }}
              >
                <PhoneField value={phone} onChange={setPhone} label={tSignup('phone')} autoFocus />
                <Turnstile onToken={setTurnstileToken} />
                <button
                  type="submit"
                  className="iridescent vx w-full"
                  disabled={loading || !isPhoneComplete(phone) || !captchaReady}
                >
                  {loading ? tSignup('sending') : t('send')}
                  <span className="drop-shadow" />
                </button>
              </form>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  requestEmailLink()
                }}
                style={{ display: 'grid', gap: '1.25rem' }}
              >
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
                <button type="submit" className="iridescent vx w-full" disabled={loading || !captchaReady}>
                  {loading ? tSignup('sending') : t('send')}
                  <span className="drop-shadow" />
                </button>
              </form>
            )}

            <p className="auth-note">
              <Link href={`/${validLocale}/signin`} className="auth-link">{t('back')}</Link>
            </p>
          </div>
        )}

        {step === 'code' && (
          <form
            onSubmit={e => {
              e.preventDefault()
              submitCode()
            }}
            style={{ display: 'grid', gap: '1.25rem' }}
          >
            <div>
              <label className="label" htmlFor="code">{tSignup('code')}</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder={tSignup('codePlaceholder')}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                maxLength={6}
                autoFocus
                required
              />
              <p className="auth-hint" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                {tSignup('codeSentTo', { phone })}
              </p>
            </div>

            <button type="submit" className="iridescent vx w-full" disabled={loading || code.length !== 6}>
              {loading ? tSignup('verifying') : tSignup('verifyCode')}
              <span className="drop-shadow" />
            </button>

            <button type="button" className="auth-link" onClick={requestPhoneCode} disabled={loading || cooldown > 0}>
              {cooldown > 0 ? tSignup('resendIn', { seconds: cooldown }) : tSignup('resendCode')}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form
            onSubmit={e => {
              e.preventDefault()
              savePassword()
            }}
            style={{ display: 'grid', gap: '1.25rem' }}
          >
            <PasswordFields
              password={password}
              confirm={confirm}
              onPassword={setPassword}
              onConfirm={setConfirm}
              labels={{
                password: t('newPassword'),
                passwordPlaceholder: tSignup('passwordPlaceholder'),
                confirm: tSignup('confirm'),
                confirmPlaceholder: tSignup('confirmPlaceholder'),
                hint: tSignup('passwordHint'),
                mismatch: tSignup('mismatch')
              }}
              showHint={password.length > 0 && !passwordOk}
              showMismatch={confirm.length > 0 && password !== confirm}
            />

            <button
              type="submit"
              className="iridescent vx w-full"
              disabled={loading || !passwordOk || password !== confirm}
            >
              {loading ? tSignup('creating') : t('save')}
              <span className="drop-shadow" />
            </button>
          </form>
        )}

        {step === 'emailSent' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="alert alert-success" style={{ padding: '1rem', borderRadius: 'var(--radius)' }}>
              {t('sent')}
            </div>
            <p className="auth-hint">{t('sentEmailHint')}</p>
            <Link href={`/${validLocale}/signin`} className="auth-link" style={{ textAlign: 'center' }}>
              {t('back')}
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
