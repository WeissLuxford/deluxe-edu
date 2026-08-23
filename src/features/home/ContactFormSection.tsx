'use client'

import { useTranslations, useLocale } from 'next-intl'

import { useState } from 'react'
import { Send } from 'lucide-react'
import PhoneField, { isPhoneComplete } from '@/features/auth/components/PhoneField'
import { PHONE_PREFIX, normalizePhone } from '@/features/auth/identity'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'

export default function ContactFormSection() {
  const t = useTranslations('home')
  const tLead = useTranslations('lead')
  const locale = useLocale()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  })
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const captchaReady = !turnstileEnabled() || Boolean(turnstileToken)
  const ready =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    isPhoneComplete(phone) &&
    captchaReady

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: normalizePhone(phone),
          source: 'HOME_FORM',
          locale,
          turnstileToken
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setErrorMessage(tLead(`errors.${data.error || 'server'}`))
        setStatus('error')
        return
      }

      setStatus('success')
      setFormData({ firstName: '', lastName: '', email: '', message: '' })
      setPhone(PHONE_PREFIX)

      setTimeout(() => setStatus('idle'), 8000)
    } catch {
      setStatus('error')
      setErrorMessage(tLead('errors.network'))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <section>
      <h2>{t('formTitle')}</h2>
      <p>{t('formLead')}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">{t('fFirst')}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="lastName">{t('fLast')}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <PhoneField value={phone} onChange={setPhone} label={t('fPhone')} />

        <div>
          <label htmlFor="email">{t('fEmail')}</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="message">{t('fMessage')}</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={t('fMessage')}
            rows={4}
          />
        </div>

        <Turnstile onToken={setTurnstileToken} />

        {status === 'success' && (
          <div>{tLead('sent')}. {tLead('sentHint')}</div>
        )}

        {status === 'error' && <div>{errorMessage}</div>}

        <button type="submit" disabled={status === 'loading' || !ready}>
          {status === 'loading' ? tLead('sending') : (
            <>
              <Send size={20} />
              {t('fSend')}
            </>
          )}
        </button>

        <p>
          {t('formDirectLine')}:{' '}
          <a href="tel:+998901234567">+998 90 123 45 67</a>{' '}
          |{' '}
          <a href="https://t.me/hge" target="_blank" rel="noopener noreferrer">@hge</a>
        </p>
      </form>
    </section>
  )
}
