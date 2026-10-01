'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { Field } from '@/design/components/Bits'
import { PhoneInput, isPhoneComplete } from '@/design/components/PhoneInput'
import { Segmented } from '@/design/components/Segmented'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'
import { emailSignupEnabled } from '@/features/auth/flags'
import { PHONE_PREFIX, normalizePhone } from '@/features/auth/identity'
import { PASSWORD_PATTERN } from '@/features/auth/password'
import { AuthShell, CodeBoxes, ErrorNote, PasswordField, Step, postJson, useCooldown } from '@/features/auth/ui/kit'
import s from '@/features/auth/ui/auth.module.css'

type Via = 'phone' | 'email'
type StepId = 'request' | 'code' | 'password' | 'emailSent'

export default function ForgotPasswordPage() {
  const t = useTranslations('authFlow')
  const locale = useLocale()
  const router = useRouter()
  const emailOn = emailSignupEnabled()

  const [via, setVia] = useState<Via>('phone')
  const [step, setStep] = useState<StepId>('request')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [ticket, setTicket] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cooldown = useCooldown()

  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }
  const captchaReady = !turnstileEnabled() || Boolean(token)
  const fail = (code: string | null) => {
    setError(t(`errors.${code ?? 'server'}`))
    setLoading(false)
  }

  async function requestCode() {
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/phone/code', { phone: normalizePhone(phone), purpose: 'RESET', turnstileToken: token })
    if (!res.ok) return fail(res.error)
    cooldown.start()
    setCode('')
    setStep('code')
    setLoading(false)
  }

  async function requestEmail() {
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/password/forgot', { email: email.trim(), turnstileToken: token })
    if (!res.ok) return fail(res.error)
    setStep('emailSent')
    setLoading(false)
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/phone/verify', { phone: normalizePhone(phone), purpose: 'RESET', code })
    if (!res.ok) return fail(res.error)
    setTicket(String(res.data.ticket))
    setStep('password')
    setLoading(false)
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/password/reset', { ticket, password, confirm: password })
    if (!res.ok) return fail(res.error)
    const signed = await signIn('credentials', { identifier: String(res.data.identifier), password, redirect: false })
    router.push(signed?.ok ? `/${locale}/learn` : `/${locale}/signin`)
    router.refresh()
  }

  const titles: Record<StepId, string> = {
    request: 'forgot.title',
    code: 'forgot.codeTitle',
    password: 'forgot.passwordTitle',
    emailSent: 'forgot.emailSentTitle'
  }

  return (
    <AuthShell title={t.rich(titles[step], rich)} lead={step === 'request' ? t('forgot.lead') : step === 'code' ? t('codeSentTo', { phone }) : undefined}>
      {step === 'request' && (
        <Step id={`request-${via}`}>
          {emailOn && (
            <Segmented<Via>
              label={t('forgot.lead')}
              value={via}
              onChange={v => {
                setVia(v)
                setError('')
              }}
              tone="white"
              options={[
                { value: 'phone', label: t('phone') },
                { value: 'email', label: t('email') }
              ]}
            />
          )}
          <form
            className={s.step}
            onSubmit={e => {
              e.preventDefault()
              if (via === 'phone') requestCode()
              else requestEmail()
            }}
          >
            {via === 'phone' ? (
              <PhoneInput label={t('phone')} value={phone} onChange={setPhone} autoFocus />
            ) : (
              <Field label={t('emailLabel')} type="email" placeholder="name@mail.uz" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus required />
            )}
            <Turnstile onToken={setToken} />
            <ErrorNote message={error} />
            <Button type="submit" size="lg" block dot disabled={loading || !captchaReady || (via === 'phone' ? !isPhoneComplete(phone) : !email.includes('@'))}>
              {t('forgot.send')}
            </Button>
          </form>
          <p className={s.muted}>
            <Link href={`/${locale}/signin`}>{t('forgot.backToSignin')}</Link>
          </p>
        </Step>
      )}

      {step === 'code' && (
        <Step id="code">
          <form className={s.step} onSubmit={verifyCode}>
            <CodeBoxes label={t('code')} value={code} onChange={setCode} />
            <div className={s.row}>
              <button type="button" className={s.link} disabled={cooldown.left > 0 || loading} onClick={requestCode}>
                {cooldown.left > 0 ? t('resendIn', { seconds: String(cooldown.left).padStart(2, '0') }) : t('resend')}
              </button>
              <button type="button" className={s.link} onClick={() => setStep('request')}>
                {t('changeNumber')}
              </button>
            </div>
            <ErrorNote message={error} />
            <Button type="submit" size="lg" block dot disabled={loading || code.length !== 6}>
              {t('signup.verify')}
            </Button>
          </form>
        </Step>
      )}

      {step === 'password' && (
        <Step id="password">
          <form className={s.step} onSubmit={save}>
            <PasswordField label={t('passwordNew')} value={password} onChange={setPassword} hint={t('passwordHint')} autoComplete="new-password" autoFocus />
            <ErrorNote message={error} />
            <Button type="submit" size="lg" block arrow disabled={loading || !PASSWORD_PATTERN.test(password)}>
              {t('forgot.save')}
            </Button>
          </form>
        </Step>
      )}

      {step === 'emailSent' && (
        <Step id="emailSent">
          <p className={s.notice}>{t('forgot.emailSent')}</p>
          <Button href={`/${locale}/signin`} size="lg" block variant="ghost">
            {t('forgot.backToSignin')}
          </Button>
        </Step>
      )}
    </AuthShell>
  )
}
