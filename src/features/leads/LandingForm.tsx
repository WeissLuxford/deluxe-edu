'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { User, Send } from 'lucide-react'
import PhoneField, { isPhoneComplete } from '@/features/auth/components/PhoneField'
import { PHONE_PREFIX, normalizePhone } from '@/features/auth/identity'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/**
 * Форма рекламного лендинга: имя и номер, больше ничего. Каждое лишнее поле на
 * экране, куда человек попал из рекламы, стоит заявок — фамилию, почту и выбор
 * тарифа спрашивает уже оператор по телефону.
 */
export default function LandingForm({ campaign }: { campaign: string }) {
  const t = useTranslations('lead')
  const locale = useLocale()

  const [firstName, setFirstName] = useState('')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [utm, setUtm] = useState<Record<string, string>>({})

  // Метки кампании живут в адресе объявления: без них не понять, какое
  // объявление окупается.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const collected: Record<string, string> = {}
    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) collected[key] = value.slice(0, 200)
    }
    setUtm(collected)
  }, [])

  const captchaReady = !turnstileEnabled() || Boolean(turnstileToken)
  const ready = firstName.trim().length > 0 && isPhoneComplete(phone) && captchaReady

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!ready || status === 'loading') return

    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          phone: normalizePhone(phone),
          source: 'LANDING',
          campaign,
          utm: Object.keys(utm).length ? utm : undefined,
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
    } catch {
      setError(t('errors.network'))
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="alert alert-success" style={{ padding: '1.25rem', textAlign: 'center' }}>
        <strong>{t('sent')}</strong>
        <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{t('sentHint')}</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
      <div>
        <label className="label" htmlFor="landing-name">
          {t('firstName')}
        </label>
        <div style={{ position: 'relative' }}>
          <User
            size={16}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)'
            }}
          />
          <input
            id="landing-name"
            className="input"
            style={{ paddingLeft: '2.25rem' }}
            value={firstName}
            onChange={event => setFirstName(event.target.value)}
            autoComplete="given-name"
            maxLength={100}
            required
          />
        </div>
      </div>

      <PhoneField value={phone} onChange={setPhone} label={t('phone')} />

      <Turnstile onToken={setTurnstileToken} />

      {error && <div className="alert alert-error">{error}</div>}

      <button type="submit" className="btn btn-primary" disabled={!ready || status === 'loading'}>
        <Send size={16} aria-hidden="true" />
        {status === 'loading' ? t('sending') : t('submit')}
      </button>
    </form>
  )
}
