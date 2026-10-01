'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { Field } from '@/design/components/Bits'
import { PhoneInput, isPhoneComplete } from '@/design/components/PhoneInput'
import { Segmented } from '@/design/components/Segmented'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'
import { emailSignupEnabled } from '@/features/auth/flags'
import { PHONE_PREFIX, normalizePhone, safeNext } from '@/features/auth/identity'
import { PASSWORD_PATTERN } from '@/features/auth/password'
import { AuthShell, CodeBoxes, Divider, ErrorNote, GoogleAuthButton, PasswordField, Step, postJson, useCooldown } from '@/features/auth/ui/kit'
import s from '@/features/auth/ui/auth.module.css'

type Method = 'phone' | 'email'
type StepId = 'start' | 'code' | 'password' | 'emailSent'

export default function SignUpPage() {
  const t = useTranslations('authFlow')
  const locale = useLocale()
  const router = useRouter()
  const search = useSearchParams()
  const next = safeNext(search.get('next'), locale)
  const emailOn = emailSignupEnabled()

  const [method, setMethod] = useState<Method>('phone')
  const [step, setStep] = useState<StepId>('start')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [ticket, setTicket] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailDelivered, setEmailDelivered] = useState(true)
  const cooldown = useCooldown()

  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }
  const captchaReady = !turnstileEnabled() || Boolean(token)
  const passwordOk = PASSWORD_PATTERN.test(password)

  const fail = (code: string | null) => {
    setError(t(`errors.${code ?? 'server'}`))
    setLoading(false)
  }

  async function requestCode() {
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/phone/code', { phone: normalizePhone(phone), purpose: 'REGISTER', turnstileToken: token })
    if (!res.ok) return fail(res.error)
    cooldown.start()
    setCode('')
    setStep('code')
    setLoading(false)
  }

  async function verifyCode(e?: FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/phone/verify', { phone: normalizePhone(phone), purpose: 'REGISTER', code })
    if (!res.ok) return fail(res.error)
    setTicket(String(res.data.ticket))
    setStep('password')
    setLoading(false)
  }

  async function register(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/register', {
      method,
      phone: method === 'phone' ? normalizePhone(phone) : undefined,
      ticket: method === 'phone' ? ticket : undefined,
      email: method === 'email' ? email.trim() : undefined,
      firstName: name.trim(),
      password,
      confirm: password,
      locale,
      turnstileToken: token
    })
    if (!res.ok) {
      if (res.error === 'invalid_ticket') setStep('start')
      return fail(res.error)
    }
    if (!res.data.canSignIn) {
      setEmailDelivered(res.data.emailDelivered !== false)
      setStep('emailSent')
      setLoading(false)
      return
    }
    const signed = await signIn('credentials', { identifier: String(res.data.identifier), password, redirect: false })
    if (signed?.ok) {
      router.push(next)
      router.refresh()
      return
    }
    fail('signin_after_register')
  }

  const titles: Record<StepId, string> = {
    start: method === 'email' ? 'signup.emailTitle' : 'signup.title',
    code: 'signup.codeTitle',
    password: 'signup.passwordTitle',
    emailSent: 'signup.emailSentTitle'
  }
  const leads: Partial<Record<StepId, string>> = {
    start: method === 'phone' ? t('signup.lead') : undefined,
    code: t('codeSentTo', { phone }),
    password: t('signup.passwordLead')
  }

  return (
    <AuthShell title={t.rich(titles[step], rich)} lead={leads[step]}>
      {step === 'start' && (
        <Step id={`start-${method}`}>
          {emailOn && (
            <Segmented<Method>
              label={t('phone')}
              value={method}
              onChange={m => {
                setMethod(m)
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
              if (method === 'phone') requestCode()
              else register(e)
            }}
          >
            <Field label={t('name')} placeholder={t('namePlaceholder')} value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" maxLength={100} required />
            {method === 'phone' ? (
              <PhoneInput label={t('phone')} value={phone} onChange={setPhone} />
            ) : (
              <>
                <Field label={t('emailLabel')} type="email" placeholder="name@mail.uz" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                <PasswordField label={t('passwordNew')} value={password} onChange={setPassword} hint={t('passwordHint')} autoComplete="new-password" />
              </>
            )}
            <Turnstile onToken={setToken} />
            <ErrorNote message={error} />
            {method === 'phone' ? (
              <Button type="submit" size="lg" block dot disabled={loading || !name.trim() || !isPhoneComplete(phone) || !captchaReady}>
                {loading ? t('signup.sending') : t('signup.sendCode')}
              </Button>
            ) : (
              <Button type="submit" size="lg" block dot disabled={loading || !name.trim() || !email.includes('@') || !passwordOk || !captchaReady}>
                {loading ? t('signup.creating') : t('signup.create')}
              </Button>
            )}
          </form>
          <Divider />
          <GoogleAuthButton callbackUrl={next} />
          <p className={s.muted}>
            {t('signup.haveAccount')} <Link href={`/${locale}/signin?next=${encodeURIComponent(next)}`}>{t('signup.signin')}</Link>
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
              <button type="button" className={s.link} onClick={() => setStep('start')}>
                {t('changeNumber')}
              </button>
            </div>
            <ErrorNote message={error} />
            <Button type="submit" size="lg" block dot disabled={loading || code.length !== 6}>
              {loading ? t('signup.verifying') : t('signup.verify')}
            </Button>
          </form>
        </Step>
      )}

      {step === 'password' && (
        <Step id="password">
          <form className={s.step} onSubmit={register}>
            <PasswordField label={t('passwordNew')} value={password} onChange={setPassword} hint={t('passwordHint')} autoComplete="new-password" autoFocus />
            <ErrorNote message={error} />
            <Button type="submit" size="lg" block arrow disabled={loading || !passwordOk}>
              {loading ? t('signup.creating') : t('signup.create')}
            </Button>
          </form>
        </Step>
      )}

      {step === 'emailSent' && (
        <Step id="emailSent">
          <p className={[s.notice, !emailDelivered && s.noticeWarn].filter(Boolean).join(' ')}>
            {emailDelivered ? t('signup.emailSent', { email }) : t('signup.emailFailed')}
          </p>
          <Button href={`/${locale}/signin`} size="lg" block>
            {t('signup.signin')}
          </Button>
        </Step>
      )}
    </AuthShell>
  )
}
