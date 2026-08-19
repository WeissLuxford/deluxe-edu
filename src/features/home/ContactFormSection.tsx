'use client'

import { useTranslations, useLocale } from 'next-intl'

import { useState } from 'react'
import { User, Mail, MessageCircle, Send } from 'lucide-react'
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
    <section className="relative py-24 vx-band vx-band--raised">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(199,164,90,0.1)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <MessageCircle size={40} color="var(--gold)" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gradient">
              {t('formTitle')}
            </h2>
            <p className="text-lg text-muted">
              {t('formLead')}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))' }}>
                <div>
                  <label htmlFor="firstName" className="label">
                    {t('fFirst')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={20}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted)',
                      }}
                    />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input"
                      
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="label">
                    {t('fLast')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={20}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted)',
                      }}
                    />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input"
                      
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))' }}>
                <PhoneField value={phone} onChange={setPhone} label={t('fPhone')} />

                <div>
                  <label htmlFor="email" className="label">
                    {t('fEmail')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={20}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted)',
                      }}
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      placeholder="john@example.com"
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="label">
                  {t('fMessage')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="textarea"
                  placeholder={t('fMessage')}
                  rows={4}
                />
              </div>

              <Turnstile onToken={setTurnstileToken} />

              {status === 'success' && (
                <div
                  className="badge-success"
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.95rem',
                    textAlign: 'center',
                  }}
                >
                  {tLead('sent')}. {tLead('sentHint')}
                </div>
              )}

              {status === 'error' && (
                <div
                  className="badge-error"
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.95rem',
                    textAlign: 'center',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !ready}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.05rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {status === 'loading' ? (
                  <>
                    <div className="spinner" />
                    {tLead('sending')}
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {t('fSend')}
                  </>
                )}
              </button>

              <p className="text-muted text-center" style={{ fontSize: '0.875rem' }}>
                {t('formDirectLine')}:{' '}
                <a href="tel:+998901234567" style={{ color: 'var(--gold-text)', textDecoration: 'underline' }}>
                  +998 90 123 45 67
                </a>{' '}
                |{' '}
                <a href="https://t.me/vertexedu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-text)', textDecoration: 'underline' }}>
                  @vertexedu
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}