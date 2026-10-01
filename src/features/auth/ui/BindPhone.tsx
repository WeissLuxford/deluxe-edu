'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { PhoneInput, isPhoneComplete } from '@/design/components/PhoneInput'
import Turnstile, { turnstileEnabled } from '../components/Turnstile'
import { PHONE_PREFIX, normalizePhone, safeNext } from '../identity'
import { CodeBoxes, ErrorNote, Step, postJson, useCooldown } from './kit'
import s from './auth.module.css'

/** Phone → SMS code → bound to the account, then back to where the student was going. */
export function BindPhone({ next }: { next: string }) {
  const t = useTranslations('authFlow')
  const locale = useLocale()
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [code, setCode] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cooldown = useCooldown()

  const fail = (key: string | null) => {
    setError(t(`errors.${key ?? 'server'}`))
    setLoading(false)
  }

  async function requestCode() {
    setLoading(true)
    setError('')
    const res = await postJson('/api/auth/phone/code', { phone: normalizePhone(phone), purpose: 'BIND', turnstileToken: token })
    if (!res.ok) return fail(res.error)
    cooldown.start()
    setCode('')
    setStep('code')
    setLoading(false)
  }

  async function confirm(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const verified = await postJson('/api/auth/phone/verify', { phone: normalizePhone(phone), purpose: 'BIND', code })
    if (!verified.ok) return fail(verified.error)
    const bound = await postJson('/api/auth/phone/bind', { ticket: verified.data.ticket })
    if (!bound.ok) return fail(bound.error)
    await update().catch(() => {})
    router.push(safeNext(next, locale))
    router.refresh()
  }

  return step === 'phone' ? (
    <Step id="phone">
      <form
        className={s.step}
        onSubmit={e => {
          e.preventDefault()
          requestCode()
        }}
      >
        <PhoneInput label={t('phone')} value={phone} onChange={setPhone} autoFocus />
        <Turnstile onToken={setToken} />
        <ErrorNote message={error} />
        <Button type="submit" size="lg" block dot disabled={loading || !isPhoneComplete(phone) || (turnstileEnabled() && !token)}>
          {loading ? t('signup.sending') : t('signup.sendCode')}
        </Button>
      </form>
    </Step>
  ) : (
    <Step id="code">
      <form className={s.step} onSubmit={confirm}>
        <p className={s.lead}>{t('codeSentTo', { phone })}</p>
        <CodeBoxes label={t('code')} value={code} onChange={setCode} />
        <div className={s.row}>
          <button type="button" className={s.link} disabled={cooldown.left > 0 || loading} onClick={requestCode}>
            {cooldown.left > 0 ? t('resendIn', { seconds: String(cooldown.left).padStart(2, '0') }) : t('resend')}
          </button>
          <button type="button" className={s.link} onClick={() => setStep('phone')}>
            {t('changeNumber')}
          </button>
        </div>
        <ErrorNote message={error} />
        <Button type="submit" size="lg" block arrow disabled={loading || code.length !== 6}>
          {loading ? t('signup.verifying') : t('signup.verify')}
        </Button>
      </form>
    </Step>
  )
}
