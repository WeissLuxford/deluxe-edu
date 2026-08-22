'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useLocaleTab } from './LocaleTabs'
import { FileOrUrlField } from './FileOrUrlField'
import type { ActionResult } from '../actions'

type Localized = { ru: string; uz: string; en: string }
type Character = { id: string; name: Localized }
type Line = { id: string; characterId: string; text: Localized; audioUrl: string }

const uid = () => Math.random().toString(36).slice(2, 9)
const emptyLocalized = (): Localized => ({ ru: '', uz: '', en: '' })

function LocalizedField({
  value,
  onChange,
  label,
  placeholder,
  textarea = false,
  compact = false
}: {
  value: Localized
  onChange: (v: Localized) => void
  label?: string
  placeholder?: string
  textarea?: boolean
  compact?: boolean
}) {
  const [active] = useLocaleTab()
  const Input: any = textarea ? 'textarea' : 'input'

  const field = (
    <Input
      className={textarea ? 'textarea' : 'input'}
      style={compact ? { flex: 1 } : undefined}
      value={value[active] ?? ''}
      placeholder={placeholder}
      rows={textarea ? 2 : undefined}
      onChange={(e: any) => onChange({ ...value, [active]: e.target.value })}
    />
  )

  if (compact) return field

  return (
    <div>
      {label && <label className="label">{label}</label>}
      {field}
    </div>
  )
}

export function DialogueBuilder({
  save,
  remove,
  initialTitle,
  initialCharacters,
  initialLines,
  hasExisting
}: {
  save: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  remove: () => Promise<ActionResult>
  initialTitle: Localized
  initialCharacters: Character[]
  initialLines: Line[]
  hasExisting: boolean
}) {
  const router = useRouter()
  const [title, setTitle] = useState<Localized>(initialTitle)
  const [characters, setCharacters] = useState<Character[]>(
    initialCharacters.length > 0
      ? initialCharacters
      : [
          { id: uid(), name: emptyLocalized() },
          { id: uid(), name: emptyLocalized() }
        ]
  )
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const patchCharacter = (idx: number, name: Localized) =>
    setCharacters(cs => cs.map((c, i) => (i === idx ? { ...c, name } : c)))

  const addCharacter = () => setCharacters(cs => [...cs, { id: uid(), name: emptyLocalized() }])

  const removeCharacter = (idx: number) => {
    const id = characters[idx].id
    setCharacters(cs => cs.filter((_, i) => i !== idx))
    setLines(ls => ls.filter(l => l.characterId !== id))
  }

  const addLine = () => {
    if (characters.length === 0) return
    setLines(ls => [...ls, { id: uid(), characterId: characters[0].id, text: emptyLocalized(), audioUrl: '' }])
  }

  const patchLine = (idx: number, next: Partial<Line>) =>
    setLines(ls => ls.map((l, i) => (i === idx ? { ...l, ...next } : l)))

  const removeLine = (idx: number) => setLines(ls => ls.filter((_, i) => i !== idx))

  const moveLine = (idx: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= lines.length) return
    setLines(ls => {
      const next = [...ls]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const characterLabel = (id: string) => {
    const idx = characters.findIndex(c => c.id === id)
    return idx >= 0 ? characters[idx].name.ru || `Персонаж ${idx + 1}` : '—'
  }

  const onSubmit = () => {
    setError(null)
    setSaved(false)

    if (!title.ru.trim()) {
      setError('Укажите название диалога по-русски')
      return
    }
    if (characters.some(c => !c.name.ru.trim())) {
      setError('У каждого персонажа должно быть имя по-русски')
      return
    }
    if (lines.length === 0) {
      setError('Добавьте хотя бы одну реплику')
      return
    }
    if (lines.some(l => !l.text.ru.trim())) {
      setError('У каждой реплики должен быть текст по-русски')
      return
    }
    if (lines.some(l => !l.audioUrl.trim())) {
      setError('У каждой реплики должно быть аудио')
      return
    }

    const form = new FormData()
    form.set('payload', JSON.stringify({ title, characters, lines }))

    startTransition(async () => {
      const res = await save(null, form)
      if (res.ok) {
        setSaved(true)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const onDelete = () => {
    if (!window.confirm('Удалить диалог вместе со всеми записями студентов?')) return
    startTransition(async () => {
      const res = await remove()
      if (res.ok) {
        setLines([])
        setTitle(emptyLocalized())
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && <div className="alert alert-error">{error}</div>}
      {saved && <div className="alert alert-success">Диалог сохранён</div>}

      <div className="card space-y-3" style={{ padding: '1.5rem' }}>
        <LocalizedField
          value={title}
          onChange={setTitle}
          label="Название диалога *"
          placeholder="В кафе"
        />

        <div>
          <label className="label">Персонажи *</label>
          <div className="space-y-2">
            {characters.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-2">
                <LocalizedField
                  compact
                  value={c.name}
                  placeholder={`Персонаж ${idx + 1}`}
                  onChange={v => patchCharacter(idx, v)}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={characters.length <= 2}
                  onClick={() => removeCharacter(idx)}
                  title={characters.length <= 2 ? 'Нужно минимум два персонажа' : 'Удалить персонажа'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={addCharacter}>
            <Plus size={14} /> Персонаж
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {lines.map((line, idx) => (
          <div key={line.id} className="card space-y-3" style={{ padding: '1.25rem' }}>
            <div className="flex items-center justify-between">
              <span className="assignment-q__num">{idx + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="order-btn"
                  disabled={idx === 0}
                  onClick={() => moveLine(idx, 'up')}
                  title="Выше"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  className="order-btn"
                  disabled={idx === lines.length - 1}
                  onClick={() => moveLine(idx, 'down')}
                  title="Ниже"
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  className="row-icon-btn row-icon-btn--danger"
                  onClick={() => removeLine(idx)}
                  title="Удалить реплику"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="label">Персонаж</label>
              <select
                className="select"
                value={line.characterId}
                onChange={e => patchLine(idx, { characterId: e.target.value })}
              >
                {characters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name.ru || characterLabel(c.id)}
                  </option>
                ))}
              </select>
            </div>

            <LocalizedField
              value={line.text}
              onChange={v => patchLine(idx, { text: v })}
              label="Текст реплики *"
              textarea
            />

            <div>
              <label className="label">Аудио реплики *</label>
              <FileOrUrlField
                value={line.audioUrl}
                onChange={v => patchLine(idx, { audioUrl: v })}
                placeholder="https://... или загрузите файл"
                folder="dialogue-line"
                accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm"
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-secondary" onClick={addLine}>
        <Plus size={16} /> Добавить реплику
      </button>

      <div className="flex items-center gap-3" style={{ marginTop: '1rem' }}>
        <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={pending}>
          {pending ? 'Сохраняю…' : 'Сохранить диалог'}
        </button>
        {hasExisting && (
          <button type="button" className="btn btn-ghost" onClick={onDelete} disabled={pending}>
            Удалить диалог
          </button>
        )}
      </div>
    </div>
  )
}
