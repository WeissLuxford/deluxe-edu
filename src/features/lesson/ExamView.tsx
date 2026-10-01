'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { PanelGrid } from '@/design/layout/AppShell'
import { QuestionCard } from '@/features/quiz/QuestionCard'
import { isAnswered, type Answer, type Answers, type QuizQuestion } from '@/features/quiz/questions'
import s from './lesson.module.css'

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type Outcome = { grade: number; correct: number; total: number; passed: boolean; reviewStatus: ReviewStatus | null; note: string | null }

type Props = {
  examId: string
  title: string
  moduleTitle: string
  passingScore: number
  questions: QuizQuestion[]
  /** In a supervised group the teacher's review decides; otherwise the score does. */
  hardGated: boolean
  prior: Outcome | null
  courseHref: string
}

export function ExamView({ examId, title, moduleTitle, passingScore, questions, hardGated, prior, courseHref }: Props) {
  const t = useTranslations('examPage')
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }
  const [phase, setPhase] = useState<'intro' | 'taking' | 'result'>(prior ? 'result' : 'intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [outcome, setOutcome] = useState<Outcome | null>(prior)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const q = questions[index]
  const last = index === questions.length - 1

  async function submit() {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/exams/${examId}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) }).catch(() => null)
    const data = res ? await res.json().catch(() => null) : null
    setBusy(false)
    if (!res?.ok || !data) return setError(t('error'))
    setOutcome({ grade: data.grade, correct: data.correct, total: data.total, passed: data.passed, reviewStatus: 'PENDING', note: null })
    setPhase('result')
  }

  const restart = () => {
    setAnswers({})
    setIndex(0)
    setPhase('taking')
  }

  let body: ReactNode
  if (questions.length === 0) {
    body = <p className={s.empty}>{t('empty')}</p>
  } else if (phase === 'intro') {
    body = (
      <div className={s.stage}>
        <span className={s.kicker}>{t('kicker')}</span>
        <h1 className={s.title}>{t.rich('introTitle', rich)}</h1>
        <p className={s.resultText}>{t('introText', { count: questions.length, module: moduleTitle, score: passingScore })}</p>
        <div className={s.resultActions}>
          <Button size="lg" arrow onClick={() => setPhase('taking')}>
            {t('start')}
          </Button>
        </div>
      </div>
    )
  } else if (phase === 'taking' && q) {
    body = (
      <div className={s.quiz}>
        <div className={s.dots} aria-hidden="true">
          {questions.map((item, i) => (
            <span key={item.id} className={s.dotStep} data-state={i === index ? 'now' : isAnswered(answers[item.id]) ? 'right' : 'todo'} />
          ))}
          <span className={s.dotCount}>
            {index + 1} / {questions.length}
          </span>
        </div>
        <QuestionCard question={q} value={answers[q.id]} onChange={(v: Answer) => setAnswers(prev => ({ ...prev, [q.id]: v }))} size="md" />
        <p className={[s.error, error && s.errorOn].filter(Boolean).join(' ')} role="alert">
          {error}
        </p>
        <div className={s.quizFoot}>
          <Button variant="soft" size="lg" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0 || busy}>
            {t('back')}
          </Button>
          <Button size="lg" dot onClick={() => (last ? submit() : setIndex(index + 1))} disabled={busy || !isAnswered(answers[q.id])}>
            {busy ? t('sending') : last ? t('submit') : t('next')}
          </Button>
        </div>
      </div>
    )
  } else if (outcome) {
    // A supervised student waits for (or reads) the teacher's decision; everyone else gets the score.
    const status = hardGated ? outcome.reviewStatus : null
    const good = status === 'APPROVED' || (!hardGated && outcome.passed)
    const title =
      status === 'PENDING' ? t.rich('pendingTitle', rich) : status === 'APPROVED' ? t.rich('approvedTitle', rich) : status === 'REJECTED' ? t.rich('rejectedTitle', rich) : t.rich(outcome.passed ? 'passedTitle' : 'failedTitle', { ...rich, grade: outcome.grade })
    body = (
      <div className={[s.result, good ? s.resultPass : s.resultFail].filter(Boolean).join(' ')}>
        <span className={s.resultTitle}>{title}</span>
        {status === 'PENDING' && <span className={s.resultText}>{t('pendingText')}</span>}
        {!status && !outcome.passed && <span className={s.resultText}>{t('failedText', { score: passingScore })}</span>}
        <span className={s.resultScore}>{t('score', { correct: outcome.correct, total: outcome.total, grade: outcome.grade })}</span>
        {outcome.note && (
          <span className={s.resultNote}>
            <b>{t('note')}:</b> {outcome.note}
          </span>
        )}
        <div className={s.resultActions}>
          {good || status === 'PENDING' ? (
            <Button href={courseHref} size="lg" arrow>
              {t('toCourse')}
            </Button>
          ) : (
            <Button size="lg" dot onClick={restart}>
              {t('retry')}
            </Button>
          )}
          {!good && status !== 'PENDING' && (
            <Button href={courseHref} size="lg" variant="ghost">
              {t('toCourse')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <PanelGrid>
      <div className={s.top}>
        <Link href={courseHref} className={s.back}>
          ← {moduleTitle}
        </Link>
        <span className={s.kicker}>{title}</span>
      </div>
      <div key={phase} className={s.stage}>
        {body}
      </div>
    </PanelGrid>
  )
}
