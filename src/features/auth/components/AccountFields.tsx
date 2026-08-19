'use client'

import { User, Lock } from 'lucide-react'

const iconStyle = {
  position: 'absolute' as const,
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--muted)'
}

export function NameFields({
  firstName,
  lastName,
  onFirstName,
  onLastName,
  labels
}: {
  firstName: string
  lastName: string
  onFirstName: (value: string) => void
  onLastName: (value: string) => void
  labels: { firstName: string; lastName: string }
}) {
  return (
    <div className="auth-grid2">
      <div>
        <label className="label" htmlFor="firstName">{labels.firstName}</label>
        <div style={{ position: 'relative' }}>
          <User size={20} style={iconStyle} />
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={e => onFirstName(e.target.value)}
            className="input"
            style={{ paddingLeft: '3rem' }}
            autoFocus
            required
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="lastName">{labels.lastName}</label>
        <div style={{ position: 'relative' }}>
          <User size={20} style={iconStyle} />
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={e => onLastName(e.target.value)}
            className="input"
            style={{ paddingLeft: '3rem' }}
            required
          />
        </div>
      </div>
    </div>
  )
}

export function PasswordFields({
  password,
  confirm,
  onPassword,
  onConfirm,
  labels,
  showHint,
  showMismatch
}: {
  password: string
  confirm: string
  onPassword: (value: string) => void
  onConfirm: (value: string) => void
  labels: {
    password: string
    passwordPlaceholder: string
    confirm: string
    confirmPlaceholder: string
    hint: string
    mismatch: string
  }
  showHint: boolean
  showMismatch: boolean
}) {
  return (
    <>
      <div>
        <label className="label" htmlFor="password">{labels.password}</label>
        <div style={{ position: 'relative' }}>
          <Lock size={20} style={iconStyle} />
          <input
            id="password"
            type="password"
            placeholder={labels.passwordPlaceholder}
            value={password}
            onChange={e => onPassword(e.target.value)}
            className="input"
            style={{ paddingLeft: '3rem' }}
            required
          />
        </div>
        {showHint && (
          <p className="auth-hint" style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{labels.hint}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="confirm">{labels.confirm}</label>
        <div style={{ position: 'relative' }}>
          <Lock size={20} style={iconStyle} />
          <input
            id="confirm"
            type="password"
            placeholder={labels.confirmPlaceholder}
            value={confirm}
            onChange={e => onConfirm(e.target.value)}
            className="input"
            style={{ paddingLeft: '3rem' }}
            required
          />
        </div>
        {showMismatch && (
          <p className="auth-hint" style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{labels.mismatch}</p>
        )}
      </div>
    </>
  )
}
