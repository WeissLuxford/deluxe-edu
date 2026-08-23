'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, XCircle, RefreshCw, BookOpen, MessageCircle, FileQuestion } from 'lucide-react'

type LocalizedText = string | Record<string, string>

type Option = { value: string; label: LocalizedText }

type Question = {
  id: string
  type: 'single' | 'multiple' | 'text' | 'code'
  question: LocalizedText
  options?: Option[]
}

type Assignment = { id: string; title: any; prompt: any }

type Result = {
  grade: number
  passed: boolean
  passingScore: number
  correct: number
  total: number
  wrongIds: string[]
}

type Props = {
  assignment: Assignment
  locale: string
  enrollmentPlan: string
  onComplete: () => void
  isCompleted: boolean
  onReviewConspect?: () => void
}

function getLocalizedText(value: LocalizedText | undefined, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value[locale]) return value[locale]
  const first = Object.values(value)[0]
  return typeof first === 'string' ? first : ''
}

function readQuestions(prompt: any): Question[] {
  return Array.isArray(prompt?.questions) ? prompt.questions : []
}

export function TestStep({
  assignment,
  locale,
  enrollmentPlan,
  onComplete,
  isCompleted,
  onReviewConspect
}: Props) {
  const t = useTranslations('test')
  const questions = readQuestions(assignment.prompt)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [submitting, setSubmitting] = useState(false)
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

  const current = questions[currentIndex]
  const total = questions.length
  const isLast = currentIndex === total - 1

  const setAnswer = (answer: any) => setAnswers(prev => ({ ...prev, [current.id]: answer }))

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/lessons/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: assignment.id, answers })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error === 'daily_limit_reached' ? t('dailyLimitError') : t('sendError'))
        return
      }

      setResult(data)
      if (data.passed) onComplete()
    } catch {
      setError(t('sendError'))
    } finally {
      setSubmitting(false)
    }
  }

  const retry = () => {
    setAnswers({})
    setCurrentIndex(0)
    setResult(null)
    setError(null)
  }

  if (result) {
    const { grade, passed, passingScore, correct, total: totalQ, wrongIds } = result
    const missed = questions.filter(q => wrongIds.includes(q.id))

    return (
      <div className="space-y-4">
        <div className={`test-result${passed ? ' passed' : ''}`}>
          <span className="test-result__icon">
            {passed ? <CheckCircle2 size={40} /> : <RefreshCw size={40} />}
          </span>
          <h2 className="test-result__title">{passed ? t('passedTitle') : t('failedTitle')}</h2>
          <div className="test-result__score">{grade}%</div>
          <p className="test-result__text">
            {passed ? t('passedText') : t('failedText', { score: passingScore })}
          </p>
        </div>

        <div className="test-summary">
          <div className="test-summary__row">
            <span>{t('correctOf', { correct, total: totalQ })}</span>
            <strong>{correct}/{totalQ}</strong>
          </div>
          <div className="test-summary__row">
            <span>{t('passingScore')}</span>
            <strong>{passingScore}%</strong>
          </div>
        </div>

        {missed.length > 0 && (
          <div className="test-mistakes">
            <h3 className="test-mistakes__title">{t('mistakesTitle')}</h3>
            <ol className="test-mistakes__list">
              {missed.map(q => (
                <li key={q.id}>
                  <XCircle size={15} />
                  <span>{getLocalizedText(q.question, locale)}</span>
                </li>
              ))}
            </ol>
            <p className="test-mistakes__hint">{t('mistakesHint')}</p>
          </div>
        )}

        {!passed && (
          <div className="test-actions">
            {onReviewConspect && (
              <button type="button" onClick={onReviewConspect} className="btn btn-secondary">
                <BookOpen size={16} />
                {t('reviewConspect')}
              </button>
            )}
            <button type="button" onClick={retry} className="btn btn-primary">
              <RefreshCw size={16} />
              {t('retry')}
            </button>
          </div>
        )}

        {(enrollmentPlan === 'PRO' || enrollmentPlan === 'DELUXE') && (
          <button type="button" className="btn btn-secondary w-full" onClick={() => alert('Telegram: @hge')}>
            <MessageCircle size={16} />
            {t('askMentor')}
          </button>
        )}
      </div>
    )
  }

  const answer = answers[current.id]
  const answered = Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
  const percent = Math.round(((currentIndex + 1) / total) * 100)

  return (
    <div className="space-y-4">
      <div className="test-progress">
        <div className="test-progress__head">
          <span>{t('question', { current: currentIndex + 1, total })}</span>
          <span className="test-progress__percent">{t('complete', { percent })}</span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="test-question">
        <h3 className="test-question__title">{getLocalizedText(current.question, locale)}</h3>

        {current.type === 'single' && (
          <div className="test-options">
            {current.options?.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setAnswer(o.value)}
                className={`test-option${answer === o.value ? ' selected' : ''}`}
              >
                {getLocalizedText(o.label, locale)}
              </button>
            ))}
          </div>
        )}

        {current.type === 'multiple' && (
          <div className="test-options">
            {current.options?.map(o => {
              const selected: string[] = answer || []
              const on = selected.includes(o.value)
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() =>
                    setAnswer(on ? selected.filter(v => v !== o.value) : [...selected, o.value])
                  }
                  className={`test-option${on ? ' selected' : ''}`}
                >
                  <span className={`test-option__box${on ? ' on' : ''}`}>
                    {on && <CheckCircle2 size={13} />}
                  </span>
                  {getLocalizedText(o.label, locale)}
                </button>
              )
            })}
          </div>
        )}

        {(current.type === 'text' || current.type === 'code') && (
          <input
            type="text"
            value={answer || ''}
            onChange={e => setAnswer(e.target.value)}
            placeholder={t('typeAnswer')}
            className="input"
          />
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="test-nav">
        <button
          type="button"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
        >
          {t('prev')}
        </button>

        <button
          type="button"
          onClick={() => (isLast ? submit() : setCurrentIndex(i => i + 1))}
          disabled={!answered || submitting}
          className="btn btn-primary test-nav__next"
        >
          {submitting ? t('sending') : isLast ? t('submit') : t('next')}
        </button>
      </div>
    </div>
  )
}
