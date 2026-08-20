'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { revokeOwnDevice } from '../deviceActions'

export function RevokeDeviceButton({
  deviceId,
  locale,
  confirmText,
  label
}: {
  deviceId: string
  locale: string
  confirmText: string
  label: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onClick = () => {
    if (!window.confirm(confirmText)) return
    setError(null)
    startTransition(async () => {
      const res = await revokeOwnDevice(deviceId, locale)
      if ('error' in res) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div>
      <button type="button" onClick={onClick} disabled={pending} className="btn btn-ghost" title={label}>
        <LogOut size={14} />
        {pending ? '…' : label}
      </button>
      {error && <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>{error}</div>}
    </div>
  )
}
