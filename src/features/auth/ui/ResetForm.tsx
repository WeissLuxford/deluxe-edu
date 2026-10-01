'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { PASSWORD_PATTERN } from '../password'
import { ErrorNote, PasswordField, Step, postJson } from './kit'
import s from './auth.module.css'

export function ResetForm({ token }: { token: string }) {
  const t = useTranslations('authFlow')
  const locale = useLocale()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/password/reset', { token, password, confirm: password })
    if (!res.ok) {
      setError(t(`errors.${res.error ?? 'server'}`))
      setLoading(false)
      return
    }
    const signed = await signIn('credentials', { identifier: String(res.data.identifier), password, redirect: false })
    router.push(signed?.ok ? `/${locale}/learn` : `/${locale}/signin`)
    router.refresh()
  }

  return (
    <Step id="reset">
      <form className={s.step} onSubmit={submit}>
        <PasswordField label={t('passwordNew')} value={password} onChange={setPassword} hint={t('passwordHint')} autoComplete="new-password" autoFocus />
        <ErrorNote message={error} />
        <Button type="submit" size="lg" block arrow disabled={loading || !PASSWORD_PATTERN.test(password)}>
          {t('reset.save')}
        </Button>
      </form>
    </Step>
  )
}
