'use client'

import { useTranslations, useLocale } from 'next-intl'

import { useState } from 'react'
import { Send } from 'lucide-react'
import PhoneField, { isPhoneComplete } from '@/features/auth/components/PhoneField'
import { PHONE_PREFIX, normalizePhone } from '@/features/auth/identity'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'
import { Section } from '@/features/ui/components/Section'
import { ChunkyButton } from '@/features/ui/components/ChunkyButton'
import { Reveal } from '@/features/ui/components/Reveal'

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
    <Section id="contact-form" tone="raised" width="narrow" title={t('formTitle')} subtitle={t('formLead')}>
      <Reveal as="form" onSubmit={handleSubmit} className="space-y-4">
        <div className="form-grid-2">
          <div>
            <label className="label" htmlFor="firstName">{t('fFirst')}</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="input"
              required
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="lastName">{t('fLast')}</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="input"
              required
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <PhoneField value={phone} onChange={setPhone} label={t('fPhone')} />

        <div>
          <label className="label" htmlFor="email">{t('fEmail')}</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="label" htmlFor="message">{t('fMessage')}</label>
          <textarea
            id="message"
            name="message"
            className="textarea"
            value={formData.message}
            onChange={handleChange}
            placeholder={t('fMessage')}
            rows={4}
          />
        </div>

        <Turnstile onToken={setTurnstileToken} />

        {status === 'success' && (
          <div className="alert alert-success">{tLead('sent')}. {tLead('sentHint')}</div>
        )}

        {status === 'error' && <div className="alert alert-error">{errorMessage}</div>}

        <ChunkyButton type="submit" color="brand" fullWidth disabled={status === 'loading' || !ready} icon={<Send size={18} />}>
          {status === 'loading' ? tLead('sending') : t('fSend')}
        </ChunkyButton>

        <p className="section-sub" style={{ textAlign: 'center' }}>
          {t('formDirectLine')}:{' '}
          <a href="tel:+998901234567">+998 90 123 45 67</a>{' '}
          |{' '}
          <a href="https://t.me/hge" target="_blank" rel="noopener noreferrer">@hge</a>
        </p>
      </Reveal>
    </Section>
  )
}
