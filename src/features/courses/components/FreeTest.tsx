'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, FileQuestion } from 'lucide-react'

type LocalizedText = string | Record<string, string>

type Option = { value: string; label: LocalizedText }

type Question = {
  id: string
  type: 'single' | 'multiple' | 'text'
  question: LocalizedText
  options?: Option[]
}

export type FreeTestResult = {
  grade: number
  correct: number
  total: number
  wrongIds: string[]
}

type Props = {
  courseSlug: string
  lessonSlug: string
  prompt: unknown
  locale: string
  submitLabel: string
  onScored: (result: FreeTestResult, questions: Question[]) => void
}

function text(value: LocalizedText | undefined, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value[locale]) return value[locale]
  const first = Object.values(value)[0]
  return typeof first === 'string' ? first : ''
}

function readQuestions(prompt: unknown): Question[] {
  const questions = (prompt as { questions?: unknown })?.questions
  return Array.isArray(questions) ? (questions as Question[]) : []
}

// Прохождение вопросов в открытой зоне: регистрации нет, поэтому ответы
// уходят на /api/free-test/score, а правильные ответы остаются в базе.
export function FreeTest({
  courseSlug,
  lessonSlug,
  prompt,
  locale,
  submitLabel,
  onScored
}: Props) {
  const t = useTranslations('test')
  const questions = readQuestions(prompt)

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (questions.length === 0) {
    return (
      <div className="test-empty">
        <FileQuestion size={40} />
        <h3>{t('notReadyTitle')}</h3>
        <p>{t('notReadyText')}</p>
      </div>
    )
  }

  const current = questions[index]
  const total = questions.length
  const isLast = index === total - 1
  const answer = answers[current.id]
  const answered = Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
  const percent = Math.round(((index + 1) / total) * 100)

  const setAnswer = (value: string | string[]) =>
    setAnswers(prev => ({ ...prev, [current.id]: value }))

  const submit = async () => {
    setSending(true)
    setError(null)
    try {
      const response = await fetch('/api/free-test/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug, lessonSlug, answers })
      })
      const data = await response.json()

      if (!response.ok || !data?.ok) {
        setError(t('sendError'))
        return
      }

      onScored(
        {
          grade: data.grade,
          correct: data.correct,
          total: data.total,
          wrongIds: Array.isArray(data.wrongIds) ? data.wrongIds : []
        },
        questions
      )
    } catch {
      setError(t('sendError'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="test-progress">
        <div className="test-progress__head">
          <span>{t('question', { current: index + 1, total })}</span>
          <span className="test-progress__percent">{t('complete', { percent })}</span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="test-question">
        <h3 className="test-question__title">{text(current.question, locale)}</h3>

        {current.type === 'single' && (
          <div className="test-options">
            {current.options?.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAnswer(option.value)}
                className={`test-option${answer === option.value ? ' selected' : ''}`}
              >
                {text(option.label, locale)}
              </button>
            ))}
          </div>
        )}

        {current.type === 'multiple' && (
          <div className="test-options">
            {current.options?.map(option => {
              const selected = Array.isArray(answer) ? answer : []
              const on = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setAnswer(on ? selected.filter(v => v !== option.value) : [...selected, option.value])
                  }
                  className={`test-option${on ? ' selected' : ''}`}
                >
                  <span className={`test-option__box${on ? ' on' : ''}`}>
                    {on && <CheckCircle2 size={13} />}
                  </span>
                  {text(option.label, locale)}
                </button>
              )
            })}
          </div>
        )}

        {current.type === 'text' && (
          <input
            type="text"
            value={typeof answer === 'string' ? answer : ''}
            onChange={event => setAnswer(event.target.value)}
            placeholder={t('typeAnswer')}
            className="input"
          />
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="test-nav">
        <button
          type="button"
          onClick={() => setIndex(i => Math.max(0, i - 1))}
          disabled={index === 0}
          className="btn btn-secondary"
        >
          {t('prev')}
        </button>

        <button
          type="button"
          onClick={() => (isLast ? submit() : setIndex(i => i + 1))}
          disabled={!answered || sending}
          className="btn btn-primary test-nav__next"
        >
          {sending ? t('sending') : isLast ? submitLabel : t('next')}
        </button>
      </div>
    </div>
  )
}
