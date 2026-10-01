'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { normalizeSerial } from './serial'
import s from './certificate.module.css'

export function CertificateLookup({ initial = '' }: { initial?: string }) {
  const t = useTranslations('certificatePage')
  const locale = useLocale()
  const router = useRouter()
  const [value, setValue] = useState(initial)
  const [error, setError] = useState(false)

  return (
    <form
      className={s.lookup}
      onSubmit={event => {
        event.preventDefault()
        const serial = normalizeSerial(value)
        // A typo is caught here, so nobody gets "not issued" for a missed
        // character and decides the certificate is fake.
        if (!serial) return setError(true)
        setError(false)
        router.push(`/${locale}/certificate/${serial}`)
      }}
    >
      <span className={s.lookupRow}>
        <input
          className={s.lookupInput}
          value={value}
          onChange={e => {
            setValue(e.target.value)
            if (error) setError(false)
          }}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          aria-invalid={error || undefined}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className={s.lookupBtn}>
          {t('submit')}
        </button>
      </span>
      <span className={[s.lookupError, error && s.lookupErrorOn].filter(Boolean).join(' ')} role="alert">
        {error ? t('badFormat') : ''}
      </span>
    </form>
  )
}
