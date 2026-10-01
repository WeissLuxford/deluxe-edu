'use client'

import { useState, type FormEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Turnstile, { turnstileEnabled } from '@/features/auth/components/Turnstile'
import { Button } from '@/design/components/Button'
import { Field } from '@/design/components/Bits'
import { PhoneInput, isPhoneComplete } from '@/design/components/PhoneInput'
import { PHONE_PREFIX } from '@/features/auth/identity'
import s from './CallbackForm.module.css'

type Source = 'HOME_FORM' | 'COURSE_PAGE' | 'CONTACTS_PAGE' | 'TRIAL_LESSON' | 'LEVEL_TEST' | 'LANDING'

type Props = {
  source: Source
  courseId?: string
  campaign?: string
  utm?: Record<string, string>
  /** Button style: on a lime block the button is ink, on ink it is lime. */
  tone?: 'onLime' | 'onWhite'
  submitLabel?: string
}

// Name + phone, nothing else: every extra field costs requests. The success
// state replaces the form in place with the same height, so nothing jumps.
export function CallbackForm({ source, courseId, campaign, utm, tone = 'onLime', submitLabel }: Props) {
  const t = useTranslations('leadForm')
  const locale = useLocale()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [token, setToken] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error' | 'limited'>('idle')

  const ready = name.trim().length > 0 && isPhoneComplete(phone) && (!turnstileEnabled() || Boolean(token))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!ready || state === 'sending') return
    setState('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: name.trim(), phone, source, courseId, campaign, utm, locale, turnstileToken: token })
      })
      if (res.status === 429) return setState('limited')
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <div className={s.root}>
      <form className={[s.form, state === 'done' && s.hidden].filter(Boolean).join(' ')} onSubmit={submit} aria-hidden={state === 'done'}>
        <Field label={t('nameLabel')} placeholder={t('namePlaceholder')} value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" required flat={tone === 'onLime'} maxLength={100} />
        <PhoneInput label={t('phoneLabel')} value={phone} onChange={setPhone} flat={tone === 'onLime'} />
        <Turnstile onToken={setToken} />
        <p className={s.error} role="alert">
          {state === 'error' ? t('error') : state === 'limited' ? t('tooMany') : ''}
        </p>
        <Button type="submit" size="lg" variant="ink" block disabled={!ready || state === 'sending'} dot={tone === 'onWhite'}>
          {state === 'sending' ? t('sending') : submitLabel ?? t('submit')}
        </Button>
      </form>

      <div className={[s.done, state === 'done' && s.doneIn].filter(Boolean).join(' ')} aria-live="polite">
        {state === 'done' && (
          <>
            <span className={s.doneTitle}>{t('doneTitle')}</span>
            <span className={s.doneText}>{t('doneText')}</span>
            <Button href={`/${locale}/level-test`} variant="ink" size="md" arrow>
              {t('doneAction')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
