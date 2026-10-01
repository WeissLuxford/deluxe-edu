'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSession, signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { Field } from '@/design/components/Bits'
import { safeNext } from '@/features/auth/identity'
import { AuthShell, Divider, ErrorNote, GoogleAuthButton, PasswordField, Step } from '@/features/auth/ui/kit'
import s from '@/features/auth/ui/auth.module.css'

const PROVIDER_ERRORS = ['google_unverified', 'link_required']

export default function SignInPage() {
  const t = useTranslations('authFlow')
  const locale = useLocale()
  const search = useSearchParams()
  const next = search.get('next')
  const providerError = search.get('error')

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(providerError && PROVIDER_ERRORS.includes(providerError) ? t(`errors.${providerError}`) : '')

  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { identifier: identifier.trim(), password, redirect: false })
    if (!res?.ok) {
      const code = res?.error === 'rate_limited' || res?.error === 'email_unverified' ? res.error : null
      setError(code ? t(`errors.${code}`) : t('signin.wrong'))
      setLoading(false)
      return
    }
    const session = await getSession()
    window.location.href = safeNext(next, locale, session?.user?.role === 'ADMIN' ? 'admin' : 'learn')
  }

  return (
    <AuthShell title={t.rich('signin.title', rich)} lead={t('signin.lead')}>
      <Step id="signin">
        <form className={s.step} onSubmit={submit}>
          <Field label={t('signin.identifier')} placeholder={t('signin.identifierPlaceholder')} value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" autoFocus required />
          <PasswordField label={t('password')} value={password} onChange={setPassword} />
          <div className={s.row}>
            <span />
            <Link href={`/${locale}/forgot-password`} className={s.link}>
              {t('signin.forgot')}
            </Link>
          </div>
          <ErrorNote message={error} />
          <Button type="submit" size="lg" block dot disabled={loading || !identifier.trim() || password.length < 6}>
            {loading ? t('signin.submitting') : t('signin.submit')}
          </Button>
        </form>
        <Divider />
        <GoogleAuthButton callbackUrl={safeNext(next, locale)} />
        <p className={s.muted}>
          {t('signin.noAccount')}{' '}
          <Link href={`/${locale}/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}>{t('signin.signup')}</Link>
        </p>
      </Step>
    </AuthShell>
  )
}
