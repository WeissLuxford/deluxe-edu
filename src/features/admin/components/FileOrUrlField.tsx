'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Upload, Loader2 } from 'lucide-react'

// Два режима: неконтролируемый (name+defaultValue, значение уходит в
// FormData обычной server-action формы, как в LessonForm) и контролируемый
// (value+onChange, для билдеров вроде DialogueBuilder, которые сами
// собирают JSON-пейлоад из React state, а не из FormData).
export function FileOrUrlField({
  name,
  value,
  defaultValue,
  onChange,
  placeholder,
  folder,
  accept
}: {
  name?: string
  value?: string
  defaultValue?: string | null
  onChange?: (value: string) => void
  placeholder?: string
  folder: string
  accept: string
}) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? '')
  const currentValue = isControlled ? (value ?? '') : internal

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.set('file', file)
      form.set('folder', folder)
      const res = await fetch('/api/uploads', { method: 'POST', body: form })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || 'Не удалось загрузить файл')
        return
      }
      setValue(data.url)
    } catch {
      setError('Не удалось загрузить файл')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          name={name}
          value={currentValue}
          onChange={e => setValue(e.target.value)}
          className="input"
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? 'Загружаю…' : 'Загрузить'}
        </button>
        <input ref={inputRef} type="file" accept={accept} hidden onChange={onFileChange} />
      </div>
      {error && (
        <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}
