'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail } from 'lucide-react'
import PhoneField, { isPhoneComplete } from '@/features/auth/components/PhoneField'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'
import { PHONE_PREFIX, normalizePhone, safeNext } from '@/features/auth/identity'
import { PASSWORD_PATTERN } from '@/features/auth/password'
import { NameFields, PasswordFields } from '@/features/auth/components/AccountFields'
import GoogleButton, { googleEnabled } from '@/features/auth/components/GoogleButton'
import { emailSignupEnabled } from '@/features/auth/flags'

type Method = 'phone' | 'email'
type Step = 'method' | 'phone' | 'code' | 'details' | 'emailSent'

export default function SignUpPage() {
  const t = useTranslations('signup')
  const tMethod = useTranslations('authMethod')
  const tErrors = useTranslations('authErrors')
  const locale = useLocale()
  const router = useRouter()
  const search = useSearchParams()

  const validLocale = ['ru', 'uz', 'en'].includes(locale) ? locale : 'ru'
  const next = safeNext(search.get('next'), validLocale)

  const showEmail = emailSignupEnabled()
  const showGoogle = googleEnabled()
  const onlyPhone = !showEmail && !showGoogle

  const [method, setMethod] = useState<Method>('phone')
  const [step, setStep] = useState<Step>(onlyPhone ? 'phone' : 'method')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [ticket, setTicket] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [emailDelivered, setEmailDelivered] = useState(true)

  const captchaReady = !turnstileEnabled() || Boolean(turnstileToken)
  const passwordOk = PASSWORD_PATTERN.test(password)
  const mismatch = confirm.length > 0 && password !== confirm
  const detailsReady =
    firstName.trim().length > 0 && lastName.trim().length > 0 && passwordOk && password === confirm

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

  const show = (key: string) => {
    setError(tErrors(key))
    setLoading(false)
  }

  const requestCode = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/phone/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizePhone(phone), purpose: 'REGISTER', turnstileToken })
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
      body: JSON.stringify({ phone: normalizePhone(phone), purpose: 'REGISTER', code })
    }).catch(() => null)

    if (!res) return show('network')

    const data = await res.json().catch(() => ({}))
    if (!res.ok) return show(data.error || 'server')

    setTicket(data.ticket)
    setStep('details')
    setLoading(false)
  }

  const register = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method,
        phone: method === 'phone' ? normalizePhone(phone) : undefined,
        ticket: method === 'phone' ? ticket : undefined,
        email: method === 'email' ? email.trim() : undefined,
        firstName,
        lastName,
        password,
        confirm,
        locale: validLocale,
        turnstileToken
      })
    }).catch(() => null)

    if (!res) return show('network')

    const data = await res.json().catch(() => ({}))
    if (!res.ok) return show(data.error || 'server')

    if (!data.canSignIn) {
      setEmailDelivered(data.emailDelivered !== false)
      setStep('emailSent')
      setLoading(false)
      return
    }

    const result = await signIn('credentials', {
      identifier: data.identifier,
      password,
      redirect: false
    })

    setLoading(false)

    if (result?.ok) {
      router.push(next)
      router.refresh()
      return
    }

    setError(tErrors('signin_after_register'))
  }

  const errorBox = error ? (
    <div
      className="auth-error"
      style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)' }}
    >
      {error}
    </div>
  ) : null

  const title =
    step === 'code' ? t('verifyTitle') : step === 'details' ? t('detailsTitle') : t('title')

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">{title}</h1>

        {errorBox}

        {step === 'method' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <p className="auth-hint">{tMethod('hint')}</p>

            <button
              type="button"
              className="iridescent vx w-full"
              onClick={() => {
                setMethod('phone')
                setStep('phone')
              }}
            >
              <Phone size={18} style={{ marginRight: '0.5rem' }} />
              {tMethod('phone')}
              <span className="drop-shadow" />
            </button>

            {showEmail && (
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => {
                  setMethod('email')
                  setStep('details')
                }}
              >
                <Mail size={18} style={{ marginRight: '0.5rem' }} />
                {tMethod('email')}
              </button>
            )}

            {showGoogle && (
              <>
                <p className="auth-hint" style={{ textAlign: 'center' }}>{tMethod('or')}</p>
                <GoogleButton callbackUrl={next} />
              </>
            )}

            <p className="auth-note">
              {t('haveAccount')}{' '}
              <Link href={`/${validLocale}/signin?next=${encodeURIComponent(next)}`} className="auth-link">
                {t('signIn')}
              </Link>
            </p>
          </div>
        )}

        {step === 'phone' && (
          <form
            onSubmit={e => {
              e.preventDefault()
              requestCode()
            }}
            style={{ display: 'grid', gap: '1.25rem' }}
          >
            <div>
              <PhoneField value={phone} onChange={setPhone} label={t('phone')} autoFocus />
              <p className="auth-hint" style={{ marginTop: '0.5rem' }}>{t('codeSent')}</p>
            </div>

            <Turnstile onToken={setTurnstileToken} />

            <button
              type="submit"
              className="iridescent vx w-full"
              disabled={loading || !isPhoneComplete(phone) || !captchaReady}
            >
              {loading ? t('sending') : t('sendCode')}
              <span className="drop-shadow" />
            </button>

            {!onlyPhone && (
              <button type="button" className="btn-ghost" onClick={() => setStep('method')} disabled={loading}>
                {t('back')}
              </button>
            )}

            <p className="auth-note">
              {t('haveAccount')}{' '}
              <Link href={`/${validLocale}/signin?next=${encodeURIComponent(next)}`} className="auth-link">
                {t('signIn')}
              </Link>
            </p>
          </form>
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
              <label className="label" htmlFor="code">{t('code')}</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder={t('codePlaceholder')}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input auth-code-input"
                style={{ textAlign: 'center' }}
                maxLength={6}
                autoFocus
                required
              />
              <p className="auth-hint" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                {t('codeSentTo', { phone })}
              </p>
            </div>

            <button type="submit" className="iridescent vx w-full" disabled={loading || code.length !== 6}>
              {loading ? t('verifying') : t('verifyCode')}
              <span className="drop-shadow" />
            </button>

            <button
              type="button"
              className="auth-link"
              onClick={requestCode}
              disabled={loading || cooldown > 0}
            >
              {cooldown > 0 ? t('resendIn', { seconds: cooldown }) : t('resendCode')}
            </button>

            <button type="button" className="btn-ghost" onClick={() => setStep('phone')} disabled={loading}>
              {t('changeNumber')}
            </button>
          </form>
        )}

        {step === 'details' && (
          <form
            onSubmit={e => {
              e.preventDefault()
              register()
            }}
            style={{ display: 'grid', gap: '1.25rem' }}
          >
            <NameFields
              firstName={firstName}
              lastName={lastName}
              onFirstName={setFirstName}
              onLastName={setLastName}
              labels={{ firstName: t('firstName'), lastName: t('lastName') }}
            />

            {method === 'email' && (
              <div>
                <label className="label" htmlFor="email">{t('emailLabel')}</label>
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
                    required
                  />
                </div>
              </div>
            )}

            <PasswordFields
              password={password}
              confirm={confirm}
              onPassword={setPassword}
              onConfirm={setConfirm}
              labels={{
                password: t('password'),
                passwordPlaceholder: t('passwordPlaceholder'),
                confirm: t('confirm'),
                confirmPlaceholder: t('confirmPlaceholder'),
                hint: t('passwordHint'),
                mismatch: t('mismatch')
              }}
              showHint={password.length > 0 && !passwordOk}
              showMismatch={mismatch}
            />

            {method === 'email' && <Turnstile onToken={setTurnstileToken} />}

            <button
              type="submit"
              className="iridescent vx w-full"
              disabled={loading || !detailsReady || (method === 'email' && (!captchaReady || !email.trim()))}
            >
              {loading ? t('creating') : t('create')}
              <span className="drop-shadow" />
            </button>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => setStep(method === 'email' ? 'method' : 'code')}
              disabled={loading}
            >
              {t('back')}
            </button>
          </form>
        )}

        {step === 'emailSent' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div
              className={emailDelivered ? 'alert alert-success' : 'alert alert-error'}
              style={{ padding: '1rem', borderRadius: 'var(--radius)' }}
            >
              {emailDelivered ? t('verifyEmailSent', { email }) : t('verifyEmailFailed')}
            </div>
            <p className="auth-hint">{emailDelivered ? t('verifyEmailHint') : t('verifyEmailFailedHint')}</p>
            <Link href={`/${validLocale}/signin`} className="iridescent vx w-full" style={{ textAlign: 'center' }}>
              {t('signIn')}
              <span className="drop-shadow" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
