'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { FormError, Input, formStyles as fs } from '@/features/staff/form/Form'

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
      <div className={fs.withButton}>
        <Input name={name} value={currentValue} onChange={e => setValue(e.target.value)} placeholder={placeholder} />
        <button type="button" className={fs.sideBtn} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className={fs.spin} /> : <Upload size={16} />}
          {uploading ? 'Загружаю…' : 'Загрузить'}
        </button>
        <input ref={inputRef} type="file" accept={accept} hidden onChange={onFileChange} />
      </div>
      {error && (
        <div style={{ marginTop: 8 }}>
          <FormError>{error}</FormError>
        </div>
      )}
    </div>
  )
}
