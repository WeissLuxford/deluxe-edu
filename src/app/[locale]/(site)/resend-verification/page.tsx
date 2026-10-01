'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { Field } from '@/design/components/Bits'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'
import { AuthShell, ErrorNote, Step, postJson } from '@/features/auth/ui/kit'
import s from '@/features/auth/ui/auth.module.css'

export default function ResendVerificationPage() {
  const t = useTranslations('authFlow')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'sent'>('idle')
  const [error, setError] = useState('')
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setState('loading')
    setError('')
    const res = await postJson('/api/resend-verification', { email: email.trim(), turnstileToken: token })
    if (!res.ok || res.data.delivered === false) {
      setError(res.ok ? t('signup.emailFailed') : t(`errors.${res.error ?? 'server'}`))
      setState('idle')
      return
    }
    setState('sent')
  }

  return (
    <AuthShell title={t.rich('resend.title', rich)} lead={state === 'sent' ? undefined : t('resend.lead')}>
      {state === 'sent' ? (
        <Step id="sent">
          <p className={s.notice}>{t('resend.sent')}</p>
          <Button href={`/${locale}/signin`} size="lg" block>
            {t('signup.signin')}
          </Button>
        </Step>
      ) : (
        <Step id="form">
          <form className={s.step} onSubmit={submit}>
            <Field label={t('emailLabel')} type="email" placeholder="name@mail.uz" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus required />
            <Turnstile onToken={setToken} />
            <ErrorNote message={error} />
            <Button type="submit" size="lg" block dot disabled={state === 'loading' || !email.includes('@') || (turnstileEnabled() && !token)}>
              {t('resend.send')}
            </Button>
          </form>
          <p className={s.muted}>
            <Link href={`/${locale}/signin`}>{t('forgot.backToSignin')}</Link>
          </p>
        </Step>
      )}
    </AuthShell>
  )
}
