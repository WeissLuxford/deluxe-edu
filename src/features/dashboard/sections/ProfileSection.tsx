'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react'

export default function ProfileSection() {
  const { data: session, update } = useSession()
  const user = session?.user
  const tProfile = useTranslations('profile')
  const tPhone = useTranslations('phoneBind')
  const tDashboard = useTranslations('dashboard')
  const locale = useLocale()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState('') // Email опциональный
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const canSave =
    firstName.trim() &&
    lastName.trim() &&
    (email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))

  const handleSave = async () => {
    setLoading(true)
    setErr(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim()
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'server')
      }

      await update()

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="dashboard-section">
      <h2 className="section-title">{tProfile('title')}</h2>

      {err && (
        <div className="alert alert-error">
          {tProfile('error')}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {tProfile('updateSuccess')}
        </div>
      )}

      <div className="card">
        <div className="card-content" style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label className="label">
              <Phone size={16} />
              {tProfile('phone')}
            </label>
            <input
              type="tel"
              value={user?.phone ? `+${user.phone}` : tPhone('notSet')}
              className="input"
              disabled
              style={{
                background: 'var(--surface-2)',
                cursor: 'not-allowed',
                opacity: 0.7
              }}
            />
            <p className="hint" style={{ marginTop: '0.5rem' }}>
              <Link href={`/${locale}/account/phone`} className="auth-link">
                {user?.phone ? tPhone('changePhone') : tPhone('addPhone')}
              </Link>
            </p>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="label">
                <User size={16} />
                {tProfile('firstName')}
              </label>
              <input
                type="text"
                placeholder={tProfile('firstName')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">
                <User size={16} />
                {tProfile('lastName')}
              </label>
              <input
                type="text"
                placeholder={tProfile('lastName')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">
              <Mail size={16} />
              {tProfile('emailOptional')}
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <p className="hint" style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>
              {tProfile('emailHint')}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave || loading}
            className="btn-primary"
            style={{ width: 'fit-content' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {tProfile('saving')}
              </>
            ) : (
              <>
                <Save size={18} />
                {tProfile('save')}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-content">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            {tProfile('accountInfo')}
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{tDashboard('roleLabel')}</span>
              <span style={{ fontWeight: 500, color: 'var(--fg)' }}>
                {user?.role || 'STUDENT'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{tProfile('phoneVerifiedLabel')}</span>
              <span style={{ fontWeight: 500, color: 'var(--fg)' }}>
                {user?.phoneVerified ? tDashboard('yes') : tDashboard('no')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{tProfile('userId')}</span>
              <span style={{ fontWeight: 500, color: 'var(--fg)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {user?.id?.slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}