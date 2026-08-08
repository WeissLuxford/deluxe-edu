'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react'

export default function ProfileSection() {
  const { data: session, update } = useSession()
  const user = session?.user

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState('') // Email опциональный
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Валидация: имя и фамилия обязательны, email опционален
  const canSave =
    firstName.trim() &&
    lastName.trim() &&
    (email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))

  const handleSave = async () => {
    setLoading(true)
    setErr(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || null // null если пустой
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      // Обновляем сессию
      await update({
        user: {
          ...user,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`
        }
      })

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
      <h2 className="section-title">Profile Settings</h2>

      {err && (
        <div className="alert alert-error">
          {err}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          Profile updated successfully!
        </div>
      )}

      <div className="card">
        <div className="card-content" style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Phone Number (Read-only) */}
          <div>
            <label className="label">
              <Phone size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              value={user?.phone || ''}
              className="input"
              disabled
              style={{ 
                background: 'var(--surface-2)', 
                cursor: 'not-allowed',
                opacity: 0.7
              }}
            />
            <p className="hint" style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>
              Phone number cannot be changed
            </p>
          </div>

          {/* First Name */}
          <div className="form-grid-2">
            <div>
              <label className="label">
                <User size={16} />
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="label">
                <User size={16} />
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="label">
              <Mail size={16} />
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <p className="hint" style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>
              Add email for notifications and account recovery
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!canSave || loading}
            className="btn-primary"
            style={{ width: 'fit-content' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-content">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Account Information
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Role:</span>
              <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>
                {user?.role || 'STUDENT'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Phone Verified:</span>
              <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>
                {user?.phoneVerified ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>User ID:</span>
              <span style={{ fontWeight: 500, color: 'var(--foreground)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {user?.id?.slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}