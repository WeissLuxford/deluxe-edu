'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { googleSignInEnabled } from '../flags'
import s from './auth.module.css'

/** Centered auth screen: big friendly heading, a lead line, then the step. */
export function AuthShell({ title, lead, children }: { title: ReactNode; lead?: ReactNode; children: ReactNode }) {
  return (
    <div className={s.shell}>
      <div className={s.head}>
        <h1 className={s.title}>{title}</h1>
        {lead && <p className={s.lead}>{lead}</p>}
      </div>
      {children}
    </div>
  )
}

/** Re-keys on every step so each one slides in instead of swapping instantly. */
export function Step({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div key={id} className={s.step}>
      {children}
    </div>
  )
}

/** Error line that reserves its space, so showing it never pushes the form. */
export function ErrorNote({ message }: { message: string }) {
  return (
    <p className={[s.error, message && s.errorOn].filter(Boolean).join(' ')} role="alert">
      {message}
    </p>
  )
}

export function Divider() {
  const t = useTranslations('authFlow')
  return <span className={s.divider}>{t('or')}</span>
}

export function GoogleAuthButton({ callbackUrl }: { callbackUrl: string }) {
  const t = useTranslations('authFlow')
  if (!googleSignInEnabled()) return null
  return (
    <button type="button" className={s.google} onClick={() => signIn('google', { callbackUrl })}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.2 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.2 5.4-4.7 7l7.6 5.9c4.4-4.1 6.8-10.2 6.8-17.4z" />
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-3.7-13.5-9.1l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
      </svg>
      {t('google')}
    </button>
  )
}

export function PasswordField({ label, value, onChange, hint, autoComplete = 'current-password', autoFocus }: { label: string; value: string; onChange: (v: string) => void; hint?: string; autoComplete?: string; autoFocus?: boolean }) {
  const t = useTranslations('authFlow')
  const [visible, setVisible] = useState(false)
  return (
    <label className={s.field}>
      {label}
      <span className={s.box}>
        <input className={s.input} type={visible ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} autoFocus={autoFocus} required minLength={6} />
        <button type="button" className={s.eye} aria-label={visible ? t('hide') : t('show')} aria-pressed={visible} onClick={() => setVisible(v => !v)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {!visible && <path d="M4 4l16 16" />}
          </svg>
        </button>
      </span>
      {hint && <span className={s.hint}>{hint}</span>}
    </label>
  )
}

/** Six visible boxes over one real input — paste, autofill from SMS and backspace all just work. */
export function CodeBoxes({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  useEffect(() => ref.current?.focus(), [])
  return (
    <label className={s.field}>
      {label}
      <span className={s.codeWrap} onClick={() => ref.current?.focus()}>
        <input
          ref={ref}
          className={s.codeInput}
          value={value}
          onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          aria-label={label}
        />
        {Array.from({ length: 6 }, (_, i) => {
          const filled = i < value.length
          const active = focused && i === Math.min(value.length, 5)
          return (
            <span key={i} className={[s.codeBox, filled && s.codeFilled, active && s.codeActive].filter(Boolean).join(' ')} aria-hidden="true">
              {value[i] ?? ''}
            </span>
          )
        })}
      </span>
    </label>
  )
}

export function useCooldown() {
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (left <= 0) return
    const id = setTimeout(() => setLeft(v => v - 1), 1000)
    return () => clearTimeout(id)
  }, [left])
  return { left, start: () => setLeft(60) }
}

export async function postJson(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown>; error: string | null }> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null)
  if (!res) return { ok: false, data: {}, error: 'network' }
  const data = ((await res.json().catch(() => ({}))) ?? {}) as Record<string, unknown>
  if (res.status === 429) return { ok: false, data, error: 'rate_limited' }
  return { ok: res.ok, data, error: res.ok ? null : String(data.error || 'server') }
}
