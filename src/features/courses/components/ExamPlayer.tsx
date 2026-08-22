'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { CheckCircle2, XCircle, RefreshCw, Clock3, MessageSquare } from 'lucide-react'

type LocalizedText = string | Record<string, string>

type Option = { value: string; label: LocalizedText }

type Question = {
  id: string
  type: 'single' | 'multiple' | 'text'
  question: LocalizedText
  options?: Option[]
}

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

type PriorAttempt = {
  grade: number
  correct: number
  total: number
  reviewStatus: ReviewStatus
  reviewNote: string | null
}

type SubmitResult = {
  grade: number
  correct: number
  total: number
  wrongIds: string[]
  passingScore: number
  passed: boolean
  reviewStatus: ReviewStatus
}

type Props = {
  examId: string
  title: string
  prompt: unknown
  passingScore: number
  courseSlug: string
  moduleTitle: string
  hardGated: boolean
  priorAttempt: PriorAttempt | null
  locale: string
}

function getLocalizedText(value: LocalizedText | undefined, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value[locale]) return value[locale]
  const first = Object.values(value)[0]
  return typeof first === 'string' ? first : ''
}

function readQuestions(prompt: unknown): Question[] {
  const p = prompt as { questions?: unknown }
  return Array.isArray(p?.questions) ? (p.questions as Question[]) : []
}

export function ExamPlayer({
  examId,
  title,
  prompt,
  passingScore,
  courseSlug,
  moduleTitle,
  hardGated,
  priorAttempt,
  locale
}: Props) {
  const t = useTranslations('exam')
  const questions = readQuestions(prompt)

  const [phase, setPhase] = useState<'intro' | 'taking' | 'result'>(priorAttempt ? 'result' : 'intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [result, setResult] = useState<SubmitResult | null>(
    priorAttempt
      ? {
          grade: priorAttempt.grade,
          correct: priorAttempt.correct,
          total: priorAttempt.total,
          wrongIds: [],
          passingScore,
          passed: priorAttempt.grade >= passingScore,
          reviewStatus: priorAttempt.reviewStatus
        }
      : null
  )
  const [reviewNote, setReviewNote] = useState(priorAttempt?.reviewNote ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const courseHref = `/${locale}/learn/${courseSlug}`

  if (questions.length === 0) {
    return (
      <div className="test-empty">
        <MessageSquare size={40} />
        <h3>{t('title')}</h3>
        <p>{t('intro', { module: moduleTitle })}</p>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-4">
        <div className="test-question">
          <h3 className="test-question__title">{title}</h3>
          <p>{t('intro', { module: moduleTitle })}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setPhase('taking')}>
          {t('start')}
        </button>
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
      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || t('sendError'))
        return
      }

      setResult({
        grade: data.grade,
        correct: data.correct,
        total: data.total,
        wrongIds: data.wrongIds,
        passingScore: data.passingScore,
        passed: data.passed,
        reviewStatus: 'PENDING'
      })
      setReviewNote(null)
      setPhase('result')
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
    setReviewNote(null)
    setError(null)
    setPhase('taking')
  }

  if (phase === 'result' && result) {
    const { grade, passed, correct, total: totalQ, wrongIds } = result
    const missed = questions.filter(q => wrongIds.includes(q.id))

    return (
      <div className="space-y-4">
        <div className={`test-result${passed ? ' passed' : ''}`}>
          <span className="test-result__icon">
            {passed ? <CheckCircle2 size={40} /> : <RefreshCw size={40} />}
          </span>
          <h2 className="test-result__title">{passed ? t('passedTitle') : t('failedTitle')}</h2>
          <div className="test-result__score">{grade}%</div>
        </div>

        <div className="test-summary">
          <div className="test-summary__row">
            <span>{t('correctOf', { correct, total: totalQ })}</span>
            <strong>
              {correct}/{totalQ}
            </strong>
          </div>
          <div className="test-summary__row">
            <span>{t('passingScore')}</span>
            <strong>{passingScore}%</strong>
          </div>
        </div>

        {missed.length > 0 && (
          <div className="test-mistakes">
            <h3 className="test-mistakes__title">Вопросы с ошибками</h3>
            <ol className="test-mistakes__list">
              {missed.map(q => (
                <li key={q.id}>
                  <XCircle size={15} />
                  <span>{getLocalizedText(q.question, locale)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {hardGated ? (
          <div className="test-actions" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            {result.reviewStatus === 'APPROVED' && (
              <>
                <p className="test-result__text">{t('approved')}</p>
                <Link href={courseHref} className="btn btn-primary">
                  {t('continueApproved')}
                </Link>
              </>
            )}

            {result.reviewStatus === 'PENDING' && (
              <>
                <p className="test-result__text">
                  <Clock3 size={15} /> {t('pendingReview')}
                </p>
                <p className="hint">{t('pendingReviewText')}</p>
                <button type="button" onClick={retry} className="btn btn-secondary">
                  <RefreshCw size={16} />
                  {t('retry')}
                </button>
              </>
            )}

            {result.reviewStatus === 'REJECTED' && (
              <>
                <p className="test-result__text">{t('rejected')}</p>
                {reviewNote && (
                  <p className="hint">
                    {t('reviewNote')}: {reviewNote}
                  </p>
                )}
                <button type="button" onClick={retry} className="btn btn-primary">
                  <RefreshCw size={16} />
                  {t('retry')}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="test-actions">
            <button type="button" onClick={retry} className="btn btn-secondary">
              <RefreshCw size={16} />
              {t('retry')}
            </button>
            <Link href={courseHref} className="btn btn-primary">
              {t('continueSoft')}
            </Link>
          </div>
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

        {current.type === 'text' && (
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
