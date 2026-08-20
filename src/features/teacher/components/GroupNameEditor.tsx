'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'
import { renameGroup } from '../groupActions'

export function GroupNameEditor({ groupId, name }: { groupId: string; name: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!editing) {
    return (
      <button
        type="button"
        className="row-icon-btn"
        title="Переименовать группу"
        onClick={() => {
          setValue(name)
          setEditing(true)
        }}
      >
        <Pencil size={14} />
      </button>
    )
  }

  const save = () => {
    setError(null)
    const form = new FormData()
    form.set('name', value)
    startTransition(async () => {
      const res = await renameGroup(groupId, null, form)
      if (res.ok) {
        setEditing(false)
        router.refresh()
      } else {
        setError(res.error ?? 'Не получилось')
      }
    })
  }

  return (
    <span className="flex items-center gap-2">
      <input
        className="input"
        value={value}
        onChange={e => setValue(e.target.value)}
        maxLength={60}
        style={{ maxWidth: '12rem' }}
        autoFocus
      />
      <button type="button" className="row-icon-btn" onClick={save} disabled={pending} title="Сохранить">
        <Check size={14} />
      </button>
      <button
        type="button"
        className="row-icon-btn"
        onClick={() => setEditing(false)}
        disabled={pending}
        title="Отмена"
      >
        <X size={14} />
      </button>
      {error && (
        <span className="text-xs" style={{ color: 'var(--danger, #dc2626)' }}>
          {error}
        </span>
      )}
    </span>
  )
}
