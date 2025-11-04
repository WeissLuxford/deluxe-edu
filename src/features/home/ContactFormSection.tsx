'use client'

import { useState } from 'react'
import { Phone, User, Mail, MessageCircle, Send } from 'lucide-react'

export default function ContactFormSection() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setStatus('success')
      setFormData({ firstName: '', lastName: '', phone: '', email: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to send message. Please try again or contact us directly.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <section className="relative py-24" style={{ background: 'var(--bg)' }}>
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
              Have Questions?
            </h2>
            <p className="text-lg text-muted">
              Leave your contact info and we'll reach out to you within 24 hours
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Name Fields */}
              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))' }}>
                <div>
                  <label htmlFor="firstName" className="label">
                    First Name *
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
                      placeholder="John"
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="label">
                    Last Name *
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
                      placeholder="Doe"
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Fields */}
              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))' }}>
                <div>
                  <label htmlFor="phone" className="label">
                    Phone Number *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone
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
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="input"
                      placeholder="+998 90 123 45 67"
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Email (optional)
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

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="label">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="textarea"
                  placeholder="Tell us what you're interested in learning..."
                  rows={4}
                />
              </div>

              {/* Status Messages */}
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
                  ✓ Message sent! We'll contact you within 24 hours.
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
                  ✗ {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-muted text-center" style={{ fontSize: '0.875rem' }}>
                Or contact us directly:{' '}
                <a href="tel:+998901234567" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
                  +998 90 123 45 67
                </a>{' '}
                |{' '}
                <a href="https://t.me/deluxeedu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
                  @deluxeedu
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}