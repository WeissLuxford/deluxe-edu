'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { PASSWORD_PATTERN } from '@/features/auth/password'
import { PasswordFields } from './AccountFields'

export default function ResetPasswordForm({ token, locale }: { token: string; locale: string }) {
  const t = useTranslations('forgot')
  const tSignup = useTranslations('signup')
  const tErrors = useTranslations('authErrors')
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordOk = PASSWORD_PATTERN.test(password)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password, confirm })
    }).catch(() => null)

    if (!res) {
      setError(tErrors('network'))
      setLoading(false)
      return
    }

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(tErrors(data.error || 'server'))
      setLoading(false)
      return
    }

    const result = await signIn('credentials', {
      identifier: data.identifier,
      password,
      redirect: false
    })

    setLoading(false)
    router.push(result?.ok ? `/${locale}/learn` : `/${locale}/signin`)
    router.refresh()
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: '1.25rem' }}>
      {error && (
        <p
          className="auth-error"
          style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)' }}
        >
          {error}
        </p>
      )}

      <PasswordFields
        password={password}
        confirm={confirm}
        onPassword={setPassword}
        onConfirm={setConfirm}
        labels={{
          password: t('newPassword'),
          passwordPlaceholder: tSignup('passwordPlaceholder'),
          confirm: tSignup('confirm'),
          confirmPlaceholder: tSignup('confirmPlaceholder'),
          hint: tSignup('passwordHint'),
          mismatch: tSignup('mismatch')
        }}
        showHint={password.length > 0 && !passwordOk}
        showMismatch={confirm.length > 0 && password !== confirm}
      />

      <button
        type="submit"
        className="iridescent vx w-full"
        disabled={loading || !passwordOk || password !== confirm}
      >
        {loading ? tSignup('creating') : t('save')}
        <span className="drop-shadow" />
      </button>
    </form>
  )
}
