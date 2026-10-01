'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Chips, Field, FormError, FormOk, Input, Section, Textarea, formStyles as fs } from '@/features/staff/form/Form'
import { useLocaleTab } from './LocaleTabs'
import type { ActionResult } from '../actions'
import s from './builder.module.css'

export type Localized = { ru: string; uz: string; en: string }
export type QuestionType = 'single' | 'multiple' | 'text'
export type Option = { value: string; label: Localized }
export type Question = {
  id: string
  type: QuestionType
  question: Localized
  options: Option[]
  correct: string | string[]
}

const TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single', label: 'Один ответ' },
  { value: 'multiple', label: 'Несколько ответов' },
  { value: 'text', label: 'Ввод текста' }
]

const TYPE_LABEL = Object.fromEntries(TYPES.map(t => [t.value, t.label])) as Record<QuestionType, string>

const uid = () => Math.random().toString(36).slice(2, 9)
const emptyLocalized = (): Localized => ({ ru: '', uz: '', en: '' })
const newOption = (): Option => ({ value: uid(), label: emptyLocalized() })
const newQuestion = (): Question => ({ id: uid(), type: 'single', question: emptyLocalized(), options: [newOption(), newOption()], correct: '' })

const WORDS = {
  test: {
    title: 'Тест',
    nameLabel: 'Название теста',
    namePlaceholder: 'Проверка по теме урока',
    needName: 'Укажи название теста по-русски',
    saved: 'Тест сохранён',
    save: 'Сохранить тест',
    remove: 'Удалить тест',
    confirm: 'Удалить тест вместе со всеми ответами учеников?',
    note: 'Ученик идёт к следующему уроку, набрав 70% и выше. Правильные ответы хранятся отдельно и в браузер ученика не попадают — оценку считает сервер.'
  },
  exam: {
    title: 'Контрольная',
    nameLabel: 'Название контрольной',
    namePlaceholder: 'Контрольная по модулю 1',
    needName: 'Укажи название контрольной по-русски',
    saved: 'Контрольная сохранена',
    save: 'Сохранить контрольную',
    remove: 'Удалить контрольную',
    confirm: 'Удалить контрольную вместе со всеми попытками учеников?',
    note: 'Правильные ответы хранятся отдельно и в браузер ученика не попадают. Результат в любом случае уходит преподавателю на разбор.'
  }
}

/** Text in the language picked in the form's language bar. */
function LocalizedText({
  value,
  onChange,
  placeholder,
  textarea,
  id
}: {
  value: Localized
  onChange: (v: Localized) => void
  placeholder?: string
  textarea?: boolean
  id?: string
}) {
  const [active] = useLocaleTab()
  const props = { id, value: value[active] ?? '', placeholder, onChange: (e: { target: { value: string } }) => onChange({ ...value, [active]: e.target.value }) }
  return textarea ? <Textarea {...props} rows={2} style={{ minHeight: 72 }} /> : <Input {...props} />
}

// One builder for the lesson test and the module exam: questions of three
// kinds, each folded into a row until opened. The page saves it as JSON.
export function TestBuilder({
  kind,
  save,
  remove,
  initialTitle,
  initialQuestions,
  initialPassingScore,
  hasExisting
}: {
  kind: 'test' | 'exam'
  save: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  remove: () => Promise<ActionResult>
  initialTitle: Localized
  initialQuestions: Question[]
  /** Exams only: the share of right answers that passes automatically. */
  initialPassingScore?: number
  hasExisting: boolean
}) {
  const w = WORDS[kind]
  const router = useRouter()
  const [title, setTitle] = useState<Localized>(initialTitle)
  const [passingScore, setPassingScore] = useState(initialPassingScore ?? 70)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions.length > 0 ? initialQuestions : [newQuestion()])
  const [openId, setOpenId] = useState<string | null>(initialQuestions.length <= 1 ? (initialQuestions[0]?.id ?? questions[0]?.id ?? null) : null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const patch = (idx: number, next: Partial<Question>) => {
    setSaved(false)
    setQuestions(qs => qs.map((q, i) => (i === idx ? { ...q, ...next } : q)))
  }

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
    if (q.type === 'single') return patch(idx, { correct: value })
    const current = Array.isArray(q.correct) ? q.correct : []
    patch(idx, { correct: current.includes(value) ? current.filter(v => v !== value) : [...current, value] })
  }

  const addQuestion = () => {
    const q = newQuestion()
    setQuestions(qs => [...qs, q])
    setOpenId(q.id)
  }

  const removeQuestion = (idx: number) => {
    const id = questions[idx].id
    setQuestions(qs => qs.filter((_, i) => i !== idx))
    setOpenId(current => (current === id ? null : current))
  }

  const moveQuestion = (idx: number, direction: -1 | 1) => {
    const target = idx + direction
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
      setError(w.needName)
      return
    }
    const form = new FormData()
    form.set('payload', JSON.stringify(kind === 'exam' ? { title, passingScore, questions } : { title, questions }))
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
    if (!window.confirm(w.confirm)) return
    startTransition(async () => {
      const res = await remove()
      if (res.ok) {
        setQuestions([newQuestion()])
        setTitle(emptyLocalized())
        setPassingScore(70)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className={fs.stack}>
      <Section title={w.title}>
        <Field label={w.nameLabel} required htmlFor={`${kind}-title`}>
          <LocalizedText id={`${kind}-title`} value={title} onChange={setTitle} placeholder={w.namePlaceholder} />
        </Field>
        {kind === 'exam' && (
          <Field label="Порог сдачи, %" htmlFor="exam-pass" hint="Автоматическая оценка. Результат в любом случае уходит преподавателю на разбор.">
            <Input id="exam-pass" type="number" min={1} max={100} value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} style={{ maxWidth: 140 }} />
          </Field>
        )}
      </Section>

      <ol className={s.list}>
        {questions.map((q, idx) => {
          const open = openId === q.id
          const preview = q.question.ru.trim() || 'Без текста вопроса'
          return (
            <li key={q.id} className={s.question} data-open={open || undefined}>
              <div className={s.head}>
                <button type="button" className={s.toggle} onClick={() => setOpenId(open ? null : q.id)} aria-expanded={open}>
                  <span className={s.num}>{idx + 1}</span>
                  <span className={s.preview}>
                    <span className={s.type}>{TYPE_LABEL[q.type]}</span>
                    <span className={s.text}>{preview}</span>
                  </span>
                </button>
                <span className={s.tools}>
                  <button type="button" className={s.tool} disabled={idx === 0} onClick={() => moveQuestion(idx, -1)} aria-label="Выше">
                    <ChevronUp size={16} />
                  </button>
                  <button type="button" className={s.tool} disabled={idx === questions.length - 1} onClick={() => moveQuestion(idx, 1)} aria-label="Ниже">
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${s.tool} ${s.danger}`}
                    disabled={questions.length === 1}
                    onClick={() => removeQuestion(idx)}
                    aria-label="Удалить вопрос"
                    title={questions.length === 1 ? 'Нужен хотя бы один вопрос' : 'Удалить вопрос'}
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </div>

              {open && (
                <div className={s.body}>
                  <Chips name={`type-${q.id}`} value={q.type} onChange={t => changeType(idx, t as QuestionType)} options={TYPES} />

                  <Field label="Вопрос" required htmlFor={`q-${q.id}`}>
                    <LocalizedText id={`q-${q.id}`} value={q.question} onChange={v => patch(idx, { question: v })} textarea placeholder="This is my brother. ___ is a student." />
                  </Field>

                  {q.type === 'text' ? (
                    <Field label="Правильный ответ" required htmlFor={`a-${q.id}`} hint="Регистр и пробелы по краям не учитываются.">
                      <Input id={`a-${q.id}`} value={typeof q.correct === 'string' ? q.correct : ''} onChange={e => patch(idx, { correct: e.target.value })} placeholder="London" />
                    </Field>
                  ) : (
                    <Field label={q.type === 'single' ? 'Варианты — отметь правильный' : 'Варианты — отметь все правильные'}>
                      <div className={s.options}>
                        {q.options.map((opt, oi) => {
                          const right = q.type === 'single' ? q.correct === opt.value : Array.isArray(q.correct) && q.correct.includes(opt.value)
                          return (
                            <div key={opt.value} className={s.option}>
                              <button
                                type="button"
                                className={s.mark}
                                data-right={right || undefined}
                                data-multi={q.type === 'multiple' || undefined}
                                onClick={() => toggleCorrect(idx, opt.value)}
                                aria-pressed={right}
                                aria-label={right ? 'Правильный ответ' : 'Отметить как правильный'}
                              >
                                {right && <Check size={16} strokeWidth={3} />}
                              </button>
                              <LocalizedText
                                value={opt.label}
                                placeholder={`Вариант ${oi + 1}`}
                                onChange={v => patch(idx, { options: q.options.map((o, i) => (i === oi ? { ...o, label: v } : o)) })}
                              />
                              <button
                                type="button"
                                className={`${s.tool} ${s.danger}`}
                                disabled={q.options.length <= 2}
                                aria-label="Убрать вариант"
                                onClick={() =>
                                  patch(idx, {
                                    options: q.options.filter((_, i) => i !== oi),
                                    correct: Array.isArray(q.correct) ? q.correct.filter(v => v !== opt.value) : q.correct === opt.value ? '' : q.correct
                                  })
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )
                        })}
                        <button type="button" className={fs.sideBtn} style={{ alignSelf: 'flex-start' }} onClick={() => patch(idx, { options: [...q.options, newOption()] })}>
                          <Plus size={16} /> Вариант
                        </button>
                      </div>
                    </Field>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <button type="button" className={s.add} onClick={addQuestion}>
        <Plus size={18} /> Добавить вопрос
      </button>

      <Section>
        {error && <FormError>{error}</FormError>}
        {saved && <FormOk>{w.saved}</FormOk>}
        <div className={fs.actions}>
          <button type="button" className={fs.inlineSubmit} onClick={onSubmit} disabled={pending}>
            {pending ? 'Сохраняю…' : w.save}
          </button>
          {hasExisting && (
            <button type="button" className={s.removeAll} onClick={onDelete} disabled={pending}>
              {w.remove}
            </button>
          )}
        </div>
        <p className={fs.hint}>{w.note}</p>
      </Section>
    </div>
  )
}
