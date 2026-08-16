'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ActionResult } from '../actions'

export function ActionButton({
  action,
  children,
  className = 'btn btn-ghost',
  title,
  disabled = false
}: {
  action: () => Promise<ActionResult>
  children: React.ReactNode
  className?: string
  title?: string
  disabled?: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  return (
    <>
      <button
        type="button"
        title={title}
        disabled={disabled || pending}
        className={className}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const res = await action()
            if (res.ok) router.refresh()
            else setError(res.error ?? null)
          })
        }}
      >
        {children}
      </button>
      {error && <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>{error}</div>}
    </>
  )
}
