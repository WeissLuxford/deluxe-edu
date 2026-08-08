'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ActionResult } from '../actions'

export function DeleteButton({
  action,
  confirmText,
  label = 'Удалить'
}: {
  action: () => Promise<ActionResult>
  confirmText: string
  label?: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onClick = () => {
    if (!window.confirm(confirmText)) return
    setError(null)
    startTransition(async () => {
      const res = await action()
      if (res.ok) router.refresh()
      else setError(res.error)
    })
  }

  return (
    <>
      <button type="button" onClick={onClick} disabled={pending} className="btn btn-ghost">
        {pending ? '…' : label}
      </button>
      {error && <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>{error}</div>}
    </>
  )
}
