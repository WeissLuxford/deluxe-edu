'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
import { useLocaleTab } from './LocaleTabs'
import type { ActionResult } from '../actions'

type Localized = { ru: string; uz: string; en: string }
type QuestionType = 'single' | 'multiple' | 'text'

type Option = { value: string; label: Localized }

type Question = {
  id: string
  type: QuestionType
  question: Localized
  options: Option[]
  correct: string | string[]
}

const TYPE_LABEL: Record<QuestionType, string> = {
  single: 'Один ответ',
  multiple: 'Несколько ответов',
  text: 'Ввод текста'
}

const uid = () => Math.random().toString(36).slice(2, 9)
const emptyLocalized = (): Localized => ({ ru: '', uz: '', en: '' })

const newOption = (): Option => ({ value: uid(), label: emptyLocalized() })

const newQuestion = (): Question => ({
  id: uid(),
  type: 'single',
  question: emptyLocalized(),
  options: [newOption(), newOption()],
  correct: ''
})

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

export function AssignmentBuilder({
  save,
  remove,
  initialTitle,
  initialQuestions,
  hasExisting
}: {
  save: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  remove: () => Promise<ActionResult>
  initialTitle: Localized
  initialQuestions: Question[]
  hasExisting: boolean
}) {
  const router = useRouter()
  const [title, setTitle] = useState<Localized>(initialTitle)
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions.length > 0 ? initialQuestions : [newQuestion()]
  )
  const [expandedId, setExpandedId] = useState<string | null>(
    initialQuestions.length <= 1 ? (initialQuestions[0]?.id ?? questions[0]?.id ?? null) : null
  )
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const patch = (idx: number, next: Partial<Question>) =>
    setQuestions(qs => qs.map((q, i) => (i === idx ? { ...q, ...next } : q)))

  const changeType = (idx: number, type: QuestionType) => {
    const q = questions[idx]
    patch(idx, {
      type,
      correct: type === 'multiple' ? [] : '',
      options: type === 'text' ? [] : q.options.length ? q.options : [newOption(), newOption()]
    })
  }

  const toggleCorrect = (idx: number, value: string) => {
    const q = questions[idx]
    if (q.type === 'single') {
      patch(idx, { correct: value })
      return
    }
    const current = Array.isArray(q.correct) ? q.correct : []
    patch(idx, {
      correct: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    })
  }

  const addQuestion = () => {
    const q = newQuestion()
    setQuestions(qs => [...qs, q])
    setExpandedId(q.id)
  }

  const removeQuestion = (idx: number) => {
    const id = questions[idx].id
    setQuestions(qs => qs.filter((_, i) => i !== idx))
    setExpandedId(current => (current === id ? null : current))
  }

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= questions.length) return
    setQuestions(qs => {
      const next = [...qs]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const onSubmit = () => {
    setError(null)
    setSaved(false)

    if (!title.ru.trim()) {
      setError('Укажите название теста по-русски')
      return
    }

    const form = new FormData()
    form.set('payload', JSON.stringify({ title, questions }))

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
    if (!window.confirm('Удалить тест вместе со всеми ответами студентов?')) return
    startTransition(async () => {
      const res = await remove()
      if (res.ok) {
        setQuestions([newQuestion()])
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
      {saved && <div className="alert alert-success">Тест сохранён</div>}

      <div className="card" style={{ padding: '1.5rem' }}>
        <LocalizedField
          value={title}
          onChange={setTitle}
          label="Название теста *"
          placeholder="Проверка по теме урока"
        />
      </div>

      {questions.map((q, idx) => {
        const expanded = expandedId === q.id
        const preview = q.question.ru.trim() || 'без текста вопроса'

        return (
          <div key={q.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              className={`assignment-q__head${expanded ? ' open' : ''}`}
              onClick={() => setExpandedId(expanded ? null : q.id)}
            >
              <ChevronRight size={16} className={`assignment-q__chevron${expanded ? ' open' : ''}`} />
              <span className="assignment-q__num">{idx + 1}</span>
              <span className="assignment-q__preview">
                <strong>{TYPE_LABEL[q.type]}</strong>
                {!expanded && <span> — {preview}</span>}
              </span>

              <div className="assignment-q__actions" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  className="order-btn"
                  disabled={idx === 0}
                  title="Выше"
                  onClick={() => moveQuestion(idx, 'up')}
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  className="order-btn"
                  disabled={idx === questions.length - 1}
                  title="Ниже"
                  onClick={() => moveQuestion(idx, 'down')}
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  className="row-icon-btn row-icon-btn--danger"
                  onClick={() => removeQuestion(idx)}
                  disabled={questions.length === 1}
                  title={questions.length === 1 ? 'Нужен хотя бы один вопрос' : 'Удалить вопрос'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {expanded && (
              <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                <div className="space-y-3">
                  <div>
                    <label className="label">Тип</label>
                    <select
                      className="select"
                      value={q.type}
                      onChange={e => changeType(idx, e.target.value as QuestionType)}
                    >
                      <option value="single">Один правильный ответ</option>
                      <option value="multiple">Несколько правильных</option>
                      <option value="text">Ввод текста</option>
                    </select>
                  </div>

                  <LocalizedField
                    value={q.question}
                    onChange={v => patch(idx, { question: v })}
                    label="Вопрос *"
                    textarea
                  />

                  {q.type === 'text' ? (
                    <div>
                      <label className="label">Правильный ответ *</label>
                      <input
                        className="input"
                        value={typeof q.correct === 'string' ? q.correct : ''}
                        onChange={e => patch(idx, { correct: e.target.value })}
                        placeholder="London"
                      />
                      <div className="hint">Регистр и пробелы по краям не учитываются.</div>
                    </div>
                  ) : (
                    <div>
                      <label className="label">
                        Варианты ответа — отметьте {q.type === 'single' ? 'правильный' : 'все правильные'}
                      </label>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const checked =
                            q.type === 'single'
                              ? q.correct === opt.value
                              : Array.isArray(q.correct) && q.correct.includes(opt.value)

                          return (
                            <div key={opt.value} className="flex items-center gap-2">
                              <input
                                type={q.type === 'single' ? 'radio' : 'checkbox'}
                                name={`correct-${q.id}`}
                                checked={checked}
                                onChange={() => toggleCorrect(idx, opt.value)}
                              />
                              <LocalizedField
                                compact
                                value={opt.label}
                                placeholder={`Вариант ${oi + 1}`}
                                onChange={v =>
                                  patch(idx, {
                                    options: q.options.map((o, i) => (i === oi ? { ...o, label: v } : o))
                                  })
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-ghost"
                                disabled={q.options.length <= 2}
                                onClick={() =>
                                  patch(idx, {
                                    options: q.options.filter((_, i) => i !== oi),
                                    correct: Array.isArray(q.correct)
                                      ? q.correct.filter(v => v !== opt.value)
                                      : q.correct === opt.value
                                        ? ''
                                        : q.correct
                                  })
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginTop: '0.75rem' }}
                        onClick={() => patch(idx, { options: [...q.options, newOption()] })}
                      >
                        <Plus size={14} /> Вариант
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <button type="button" className="btn btn-secondary" onClick={addQuestion}>
        <Plus size={16} /> Добавить вопрос
      </button>

      <div className="flex items-center gap-3" style={{ marginTop: '1rem' }}>
        <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={pending}>
          {pending ? 'Сохраняю…' : 'Сохранить тест'}
        </button>
        {hasExisting && (
          <button type="button" className="btn btn-ghost" onClick={onDelete} disabled={pending}>
            Удалить тест
          </button>
        )}
      </div>

      <div className="hint">
        Правильные ответы сохраняются отдельно и в браузер студента не попадают —
        оценку считает сервер.
      </div>
    </div>
  )
}
