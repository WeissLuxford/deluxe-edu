'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { RichText } from '@/design/components/RichText'
import { PanelGrid } from '@/design/layout/AppShell'
import { CONTACTS } from '@/content/contacts'
import type { Answer, Answers, QuizQuestion } from '@/features/quiz/questions'
import { QuizRunner, type QuizResult } from './QuizRunner'
import { VideoFrame } from './VideoFrame'
import s from './lesson.module.css'

export type Step = 'video' | 'conspect' | 'test'

export type LessonViewProps = {
  mode: 'learn' | 'trial'
  lesson: { id: string; slug: string; title: string; content: string; videoUrl: string | null; index: number; durationMin: number | null; moduleTitle: string }
  steps: Step[]
  initialStep: Step | null
  questions: QuizQuestion[]
  assignmentId: string | null
  alreadyPassed: boolean
  teacherReviews: boolean
  back: { href: string; label: string }
  /** Where "next" leads after the lesson: the next lesson, or back to the program. */
  next: { href: string; label: string }
  /** Extra block shown after a trial lesson ends. */
  trialEnd?: ReactNode
}

/** Headings of the notes, for the "In this lesson" list. Works for HTML and the legacy "## " format. */
function headingsOf(content: string): string[] {
  const html = [...content.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim())
  const md = [...content.matchAll(/^#{2,3}\s+(.+)$/gm)].map(m => m[1].trim())
  return [...html, ...md].filter(Boolean).slice(0, 8)
}

export function LessonView(props: LessonViewProps) {
  const { mode, lesson, steps, questions, back, next } = props
  const t = useTranslations('lessonFlow')
  const router = useRouter()
  const start = props.initialStep && steps.includes(props.initialStep) ? steps.indexOf(props.initialStep) : 0
  const [stepIndex, setStepIndex] = useState(start)
  const [passed, setPassed] = useState(props.alreadyPassed)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState('')
  const reported = useRef<Step | null>(null)
  const articleRef = useRef<HTMLDivElement>(null)

  const step = steps[stepIndex] ?? 'conspect'
  const isLast = stepIndex >= steps.length - 1
  const headings = useMemo(() => headingsOf(lesson.content), [lesson.content])
  const learn = mode === 'learn'

  // Remember the step, so "Continue" brings the student back exactly here.
  useEffect(() => {
    if (!learn || reported.current === step) return
    reported.current = step
    fetch('/api/lessons/step', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lessonId: lesson.id, step }) }).catch(() => {})
  }, [learn, step, lesson.id])

  // Five seconds on the video counts as "watched".
  useEffect(() => {
    if (!learn || step !== 'video') return
    const id = setTimeout(() => {
      fetch('/api/lessons/watch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lessonId: lesson.id }) }).catch(() => {})
    }, 5000)
    return () => clearTimeout(id)
  }, [learn, step, lesson.id])

  const go = (index: number) => {
    setStepIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function finish() {
    // A lesson without a test is completed explicitly; with a test, the submit already did it.
    if (learn && !questions.length && !passed) {
      setFinishing(true)
      setError('')
      const res = await fetch('/api/lessons/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lessonId: lesson.id }) }).catch(() => null)
      setFinishing(false)
      if (!res) return setError(t('error'))
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        return setError(data?.error === 'daily_limit_reached' ? t('limit') : t('error'))
      }
      setPassed(true)
    }
    if (mode === 'trial' && props.trialEnd) return setPassed(true)
    router.push(next.href)
    router.refresh()
  }

  const check = async (questionId: string, answer: Answer) => {
    const url = learn ? '/api/lessons/check' : '/api/free-test/check'
    const body = learn ? { assignmentId: props.assignmentId, questionId, answer } : { lessonSlug: lesson.slug, questionId, answer }
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    return res.ok ? ((await res.json()) as { correct: boolean; right: string[] }) : null
  }

  const submit = async (answers: Answers): Promise<QuizResult | { error: 'limit' | 'failed' }> => {
    if (learn) {
      const res = await fetch('/api/lessons/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignmentId: props.assignmentId, answers }) })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data) return { error: data?.error === 'daily_limit_reached' ? 'limit' : 'failed' }
      return { grade: data.grade, passed: data.passed, passingScore: data.passingScore, correct: data.correct, total: data.total }
    }
    const res = await fetch('/api/free-test/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseSlug: 'trial-lesson', lessonSlug: lesson.slug, answers }) })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.ok) return { error: 'failed' }
    return { grade: data.grade, passed: data.grade >= 70, passingScore: 70, correct: data.correct, total: data.total }
  }

  const scrollToHeading = (text: string) => {
    const el = [...(articleRef.current?.querySelectorAll('h2, h3') ?? [])].find(h => h.textContent?.trim() === text)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const nextStepLabel = (() => {
    const following = steps[stepIndex + 1]
    if (following === 'conspect') return t('toNotes')
    if (following === 'test') return t('toTest', { count: questions.length })
    return null
  })()

  const finishButton = (
    <Button size="lg" arrow onClick={finish} disabled={finishing}>
      {finishing ? t('finishing') : next.label}
    </Button>
  )

  const rail = (
    <>
      {steps.includes('video') && step !== 'video' && lesson.videoUrl && (
        <button type="button" className={s.mini} onClick={() => go(steps.indexOf('video'))}>
          <span className={s.miniPlay} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          {t('rewatch')}
        </button>
      )}
      {step === 'conspect' && headings.length > 0 && (
        <div className={s.toc}>
          <span className={s.railTitle}>{t('inLesson')}</span>
          {headings.map(h => (
            <button key={h} type="button" className={s.tocItem} onClick={() => scrollToHeading(h)}>
              {h}
            </button>
          ))}
        </div>
      )}
      <div className={s.ask}>
        <span className={s.railTitle}>{t('askTitle')}</span>
        <span className={s.askText}>{t('askText')}</span>
        <a href={`https://t.me/${CONTACTS.telegram}`} target="_blank" rel="noreferrer" className={s.askBtn}>
          {t('askBtn')}
        </a>
      </div>
    </>
  )

  const content = (
    <>
      <div className={s.top}>
        <Link href={back.href} className={s.back}>
          ← {back.label}
        </Link>
        {steps.length > 1 && (
          <div className={s.steps} role="tablist">
            {steps.map((item, i) => {
              const done = i < stepIndex || (item === 'test' && passed)
              const reachable = i <= stepIndex || passed
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={i === stepIndex}
                  className={s.stepPill}
                  data-state={i === stepIndex ? 'now' : done ? 'done' : 'todo'}
                  disabled={!reachable}
                  onClick={() => go(i)}
                >
                  <span className={s.stepNum}>{done && i !== stepIndex ? '✓' : i + 1}</span>
                  {t(`steps.${item}`)}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div key={step} className={s.stage}>
        {step === 'video' && (
          <>
            <div className={s.kicker}>{lesson.durationMin ? t('metaMin', { n: lesson.index, min: lesson.durationMin }) : t('meta', { n: lesson.index })}</div>
            <h1 className={s.title}>{lesson.title}</h1>
            <VideoFrame url={lesson.videoUrl} />
          </>
        )}

        {step === 'conspect' && (
          <article ref={articleRef} className={s.article}>
            <span className={s.kicker}>
              {lesson.moduleTitle ? `${lesson.moduleTitle} · ` : ''}
              {lesson.durationMin ? t('metaMin', { n: lesson.index, min: lesson.durationMin }) : t('meta', { n: lesson.index })}
            </span>
            <h1 className={s.title}>{lesson.title}</h1>
            {lesson.content.trim() ? <RichText text={lesson.content} /> : <p className={s.empty}>{t('notesEmpty')}</p>}
          </article>
        )}

        {step === 'test' && (
          <QuizRunner
            questions={questions}
            check={check}
            submit={submit}
            onPassed={() => setPassed(true)}
            onReviewNotes={steps.includes('conspect') ? () => go(steps.indexOf('conspect')) : undefined}
            teacherReviews={props.teacherReviews}
            passedActions={finishButton}
          />
        )}
      </div>

      {mode === 'trial' && passed && props.trialEnd}

      {step !== 'test' && (
        <div className={s.cta}>
          <p className={[s.error, error && s.errorOn].filter(Boolean).join(' ')} role="alert">
            {error}
          </p>
          {!isLast && nextStepLabel ? (
            <Button size="lg" dot onClick={() => go(stepIndex + 1)}>
              {nextStepLabel}
            </Button>
          ) : (
            finishButton
          )}
        </div>
      )}
    </>
  )

  return mode === 'learn' ? (
    <PanelGrid rail={rail}>{content}</PanelGrid>
  ) : (
    <div className={s.trialPanel}>
      <PanelGrid rail={rail}>{content}</PanelGrid>
    </div>
  )
}
