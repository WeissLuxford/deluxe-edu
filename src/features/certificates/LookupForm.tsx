'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeSerial } from './serial'

export function LookupForm({
  locale,
  labels
}: {
  locale: string
  labels: { placeholder: string; submit: string; help: string; badFormat: string }
}) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        const serial = normalizeSerial(value)
        // Опечатку ловим здесь, чтобы человек не получил «не найден» из-за
        // пропущенного символа и не решил, что сертификат поддельный.
        if (!serial) {
          setError(labels.badFormat)
          return
        }
        setError(null)
        router.push(`/${locale}/certificate/${serial}`)
      }}
      style={{ display: 'grid', gap: '0.75rem', maxWidth: '28rem' }}
    >
      <input
        className="input doc-serial"
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder={labels.placeholder}
        aria-label={labels.placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--muted)' }}>{labels.help}</p>
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>
        {labels.submit}
      </button>
    </form>
  )
}
