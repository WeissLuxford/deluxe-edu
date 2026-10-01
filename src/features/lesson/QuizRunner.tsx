'use client'

import { useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { QuestionCard, type Review } from '@/features/quiz/QuestionCard'
import { isAnswered, type Answer, type Answers, type QuizQuestion } from '@/features/quiz/questions'
import s from './lesson.module.css'

export type QuizResult = { grade: number; passed: boolean; passingScore: number; correct: number; total: number }

type Props = {
  questions: QuizQuestion[]
  /** Checks one answer; returns null on failure. */
  check: (questionId: string, answer: Answer) => Promise<{ correct: boolean; right: string[] } | null>
  /** Sends all answers for the final grade. */
  submit: (answers: Answers) => Promise<QuizResult | { error: 'limit' | 'failed' }>
  onPassed?: (result: QuizResult) => void
  onReviewNotes?: () => void
  teacherReviews?: boolean
  passedActions?: ReactNode
}

// The Quiz artboard: one question, pick → check → see right/wrong → next.
// The final grade (and the lesson's progress) is set by one submit at the end.
export function QuizRunner({ questions, check, submit, onPassed, onReviewNotes, teacherReviews, passedActions }: Props) {
  const t = useTranslations('lessonFlow')
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [reviews, setReviews] = useState<Record<string, Review & { right: string[] }>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<QuizResult | null>(null)

  if (questions.length === 0) return <p className={s.empty}>{t('testEmpty')}</p>

  const q = questions[index]
  const review = reviews[q.id] ?? null
  const last = index === questions.length - 1

  const reset = () => {
    setIndex(0)
    setAnswers({})
    setReviews({})
    setResult(null)
    setError('')
  }

  async function onCheck() {
    setBusy(true)
    setError('')
    const res = await check(q.id, answers[q.id]).catch(() => null)
    setBusy(false)
    if (!res) return setError(t('error'))
    setReviews(prev => ({ ...prev, [q.id]: { correct: res.correct, rightValues: res.right, right: res.right } }))
  }

  async function onNext() {
    if (!last) return setIndex(index + 1)
    setBusy(true)
    setError('')
    const res = await submit(answers).catch(() => ({ error: 'failed' as const }))
    setBusy(false)
    if ('error' in res) return setError(res.error === 'limit' ? t('limit') : t('error'))
    setResult(res)
    if (res.passed) onPassed?.(res)
  }

  if (result) {
    return (
      <div className={[s.result, result.passed ? s.resultPass : s.resultFail].filter(Boolean).join(' ')}>
        <span className={s.resultTitle}>{t.rich(result.passed ? 'passedTitle' : 'failedTitle', { ...rich, grade: result.grade })}</span>
        <span className={s.resultText}>{result.passed ? t('passedText') : t('failedText', { score: result.passingScore })}</span>
        <span className={s.resultScore}>{t('correctOf', { correct: result.correct, total: result.total })}</span>
        {teacherReviews && <span className={s.resultNote}>{t('teacherNote')}</span>}
        <div className={s.resultActions}>
          {result.passed ? (
            passedActions
          ) : (
            <>
              <Button size="lg" onClick={reset} dot>
                {t('retry')}
              </Button>
              {onReviewNotes && (
                <Button size="lg" variant="ghost" onClick={onReviewNotes}>
                  {t('reviewNotes')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const optionText = (values: string[]) =>
    values.map(v => q.options.find(o => o.value === v)?.label ?? v).join(', ')

  return (
    <div className={s.quiz}>
      <div className={s.dots} aria-hidden="true">
        {questions.map((item, i) => {
          const r = reviews[item.id]
          return <span key={item.id} className={s.dotStep} data-state={i === index ? 'now' : r ? (r.correct ? 'right' : 'wrong') : 'todo'} />
        })}
        <span className={s.dotCount}>
          {index + 1} / {questions.length}
        </span>
      </div>

      <QuestionCard
        question={q}
        value={answers[q.id]}
        onChange={(value: Answer) => setAnswers(prev => ({ ...prev, [q.id]: value }))}
        review={review}
        size="md"
      />

      <div className={[s.feedback, review && s.feedbackOn, review && (review.correct ? s.feedbackRight : s.feedbackWrong)].filter(Boolean).join(' ')} aria-live="polite">
        {review && (
          <>
            <span className={s.feedbackMark}>{review.correct ? '✓' : '!'}</span>
            <span className={s.feedbackBody}>
              <span className={s.feedbackTitle}>{review.correct ? t('right') : t('wrong')}</span>
              {!review.correct && q.type === 'text' && review.right.length > 0 && <span>{t('rightText', { answer: review.right.join(' / ') })}</span>}
              {!review.correct && q.type === 'multiple' && <span>{t('rightText', { answer: optionText(review.right) })}</span>}
            </span>
          </>
        )}
      </div>

      <p className={[s.error, error && s.errorOn].filter(Boolean).join(' ')} role="alert">
        {error}
      </p>

      <div className={s.quizFoot}>
        <span className={s.calm}>{t('calm')}</span>
        {review ? (
          <Button size="lg" dot onClick={onNext} disabled={busy}>
            {busy ? t('sending') : last ? t('done') : t('next')}
          </Button>
        ) : (
          <Button size="lg" onClick={onCheck} disabled={busy || !isAnswered(answers[q.id])}>
            {busy ? t('checking') : t('check')}
          </Button>
        )}
      </div>
    </div>
  )
}
