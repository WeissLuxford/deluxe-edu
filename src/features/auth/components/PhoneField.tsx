'use client'

import { Phone } from 'lucide-react'
import { digitsOf, PHONE_PREFIX, UZ_PHONE_DIGITS } from '../identity'

type PhoneFieldProps = {
  value: string
  onChange: (formatted: string) => void
  label?: string
  id?: string
  name?: string
  required?: boolean
  autoFocus?: boolean
  disabled?: boolean
}

export function isPhoneComplete(value: string): boolean {
  return digitsOf(value).length === UZ_PHONE_DIGITS
}

function nationalDigits(value: string): string {
  const digits = digitsOf(value)
  if (digits.startsWith('998')) return digits.slice(3, UZ_PHONE_DIGITS)
  if (digits.startsWith('8') && digits.length === 10) return digits.slice(1)
  return digits.slice(0, 9)
}

function groupNational(digits: string): string {
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}

export default function PhoneField({
  value,
  onChange,
  label,
  id = 'phone',
  name = 'phone',
  required = true,
  autoFocus = false,
  disabled = false
}: PhoneFieldProps) {
  const national = nationalDigits(value)
  const shown = groupNational(national)

  const emit = (digits: string) => {
    const limited = digits.slice(0, 9)
    onChange(limited.length === 0 ? PHONE_PREFIX : `${PHONE_PREFIX}${groupNational(limited)}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    emit(nationalDigits(e.target.value))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    emit(nationalDigits(e.clipboardData.getData('text')))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
    }
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <Phone
          size={20}
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)',
            pointerEvents: 'none'
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '3rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--fg)',
            fontSize: '1rem',
            letterSpacing: '0.02em',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          +998
        </span>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="90 123 45 67"
          value={shown}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className="input"
          style={{ paddingLeft: '6.25rem', fontSize: '1rem', letterSpacing: '0.02em' }}
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          aria-describedby={`${id}-prefix`}
        />
        <span id={`${id}-prefix`} className="sr-only">
          +998
        </span>
      </div>
    </div>
  )
}
