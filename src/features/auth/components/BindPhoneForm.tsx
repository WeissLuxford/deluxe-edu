'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import PhoneField, { isPhoneComplete } from './PhoneField'
import Turnstile, { turnstileEnabled } from './Turnstile'
import { PHONE_PREFIX, normalizePhone, safeNext } from '../identity'

export default function BindPhoneForm({ locale, next }: { locale: string; next: string }) {
  const t = useTranslations('phoneBind')
  const tSignup = useTranslations('signup')
  const tErrors = useTranslations('authErrors')
  const router = useRouter()
  const { update } = useSession()

  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const captchaReady = !turnstileEnabled() || Boolean(turnstileToken)

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

  const requestCode = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/phone/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizePhone(phone), purpose: 'BIND', turnstileToken })
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

    const verified = await fetch('/api/auth/phone/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizePhone(phone), purpose: 'BIND', code })
    }).catch(() => null)

    if (!verified) return show('network')

    const verifiedData = await verified.json().catch(() => ({}))
    if (!verified.ok) return show(verifiedData.error || 'server')

    const bound = await fetch('/api/auth/phone/bind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket: verifiedData.ticket })
    }).catch(() => null)

    if (!bound) return show('network')

    const boundData = await bound.json().catch(() => ({}))
    if (!bound.ok) return show(boundData.error || 'server')

    await update()

    setLoading(false)
    router.push(safeNext(next, locale))
    router.refresh()
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {error && (
        <p
          className="auth-error"
          style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)' }}
        >
          {error}
        </p>
      )}

      {step === 'phone' ? (
        <form
          onSubmit={e => {
            e.preventDefault()
            requestCode()
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
            {loading ? tSignup('verifying') : t('verify')}
            <span className="drop-shadow" />
          </button>

          <button type="button" className="auth-link" onClick={requestCode} disabled={loading || cooldown > 0}>
            {cooldown > 0 ? tSignup('resendIn', { seconds: cooldown }) : tSignup('resendCode')}
          </button>

          <button type="button" className="btn-ghost" onClick={() => setStep('phone')} disabled={loading}>
            {tSignup('changeNumber')}
          </button>
        </form>
      )}
    </div>
  )
}
