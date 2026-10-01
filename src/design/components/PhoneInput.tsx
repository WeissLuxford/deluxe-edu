'use client'

import type { ChangeEvent, ClipboardEvent, KeyboardEvent, ReactNode } from 'react'
import { digitsOf, PHONE_PREFIX, UZ_PHONE_DIGITS } from '@/features/auth/identity'
import s from './PhoneInput.module.css'

export function isPhoneComplete(value: string): boolean {
  return digitsOf(value).length === UZ_PHONE_DIGITS
}

function nationalDigits(value: string): string {
  const digits = digitsOf(value)
  if (digits.startsWith('998')) return digits.slice(3, UZ_PHONE_DIGITS)
  if (digits.startsWith('8') && digits.length === 10) return digits.slice(1)
  return digits.slice(0, 9)
}

function group(d: string): string {
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`
}

type Props = {
  label: ReactNode
  value: string
  onChange: (formatted: string) => void
  name?: string
  flat?: boolean
  required?: boolean
  disabled?: boolean
  autoFocus?: boolean
}

// "+998" is drawn inside the field, not typed into the value: people paste
// numbers in every format and the prefix must never be deleted by accident.
export function PhoneInput({ label, value, onChange, name = 'phone', flat, required = true, disabled, autoFocus }: Props) {
  const shown = group(nationalDigits(value))

  const emit = (digits: string) => {
    const limited = digits.slice(0, 9)
    onChange(limited.length === 0 ? PHONE_PREFIX : `${PHONE_PREFIX}${group(limited)}`)
  }

  return (
    <label className={s.field}>
      {label}
      <span className={[s.box, flat && s.flat].filter(Boolean).join(' ')}>
        <span className={s.prefix} aria-hidden="true">+998</span>
        <input
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="90 123 45 67"
          value={shown}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className={s.input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => emit(nationalDigits(e.target.value))}
          onPaste={(e: ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault()
            emit(nationalDigits(e.clipboardData.getData('text')))
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault()
          }}
        />
      </span>
    </label>
  )
}
