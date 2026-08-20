'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import type { ActionResult } from '../actions'

export function DeleteButton({
  action,
  confirmText,
  label = 'Удалить',
  variant = 'text',
  title
}: {
  action: () => Promise<ActionResult>
  confirmText: string
  label?: string
  variant?: 'text' | 'icon'
  title?: string
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
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          className="row-icon-btn row-icon-btn--danger"
          title={title ?? label}
        >
          {pending ? '…' : <Trash2 size={14} />}
        </button>
      ) : (
        <button type="button" onClick={onClick} disabled={pending} className="btn btn-ghost">
          {pending ? '…' : label}
        </button>
      )}
      {error && <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>{error}</div>}
    </>
  )
}
