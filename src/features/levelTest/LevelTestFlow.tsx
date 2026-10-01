'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { RichText } from '@/design/components/RichText'
import { levelVars, type LevelCode } from '@/design/levels'
import { FocusBar, QuestionCard } from '@/features/quiz/QuestionCard'
import { isAnswered, type Answer, type Answers, type QuizQuestion } from '@/features/quiz/questions'
import s from './levelTest.module.css'

export type TestSection = { slug: string; title: string; content: string; questions: QuizQuestion[] }

type Props = {
  sections: TestSection[]
  /** Best course to start with for each level, if one is published. */
  recommended: Partial<Record<LevelCode, string>>
}

// Bands are tuned to the question bank, which grows harder as it goes: 60%
// right is a solid B1, not "half the knowledge".
function levelFor(percent: number): LevelCode {
  if (percent >= 90) return 'C1'
  if (percent >= 75) return 'B2'
  if (percent >= 55) return 'B1'
  if (percent >= 25) return 'A2'
  return 'A1'
}

type Flat = { section: TestSection; sectionIndex: number; question: QuizQuestion; last: boolean }

export function LevelTestFlow({ sections, recommended }: Props) {
  const t = useTranslations('levelTestPage')
  const tq = useTranslations('quiz')
  const locale = useLocale()
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  // One flat list across sections: the person sees a single smooth test,
  // while scoring still goes section by section so no answer key is exposed.
  const flat = useMemo<Flat[]>(
    () =>
      sections.flatMap((section, sectionIndex) =>
        section.questions.map((question, i) => ({ section, sectionIndex, question, last: i === section.questions.length - 1 }))
      ),
    [sections]
  )

  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [scores, setScores] = useState<{ correct: number; total: number }[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const [done, setDone] = useState(false)

  const current = flat[index]

  const setAnswer = (value: Answer) => setAnswers(prev => ({ ...prev, [current.question.id]: value }))

  async function advance(skip = false) {
    const nextAnswers = skip ? { ...answers, [current.question.id]: '' } : answers
    if (skip) setAnswers(nextAnswers)
    if (!current.last) return setIndex(index + 1)

    setSending(true)
    setError(false)
    const sectionAnswers = Object.fromEntries(current.section.questions.map(q => [q.id, nextAnswers[q.id] ?? '']))
    try {
      const res = await fetch('/api/free-test/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: 'level-test', lessonSlug: current.section.slug, answers: sectionAnswers })
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error('score')
      setScores(prev => [...prev, { correct: data.correct, total: data.total }])
      if (index === flat.length - 1) setDone(true)
      else setIndex(index + 1)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  const restart = () => {
    setStarted(false)
    setIndex(0)
    setAnswers({})
    setScores([])
    setDone(false)
  }

  if (!started) {
    return (
      <div className={s.intro}>
        <h1 className={s.introTitle}>{t.rich('introTitle', rich)}</h1>
        <p className={s.introLead}>{t('introLead', { questions: flat.length })}</p>
        <div className={s.stickers} aria-hidden="true">
          {(['A1', 'A2', 'B1', 'B2', 'C1'] as LevelCode[]).map((code, i) => (
            <span key={code} className={s.mini} style={{ background: levelVars(code).bg, color: levelVars(code).fg, animationDelay: `${i * 70}ms` }}>
              {code}
            </span>
          ))}
        </div>
        <Button size="lg" arrow onClick={() => setStarted(true)} disabled={flat.length === 0}>
          {t('start')}
        </Button>
        {flat.length === 0 && <p className={s.introLead}>{tq('empty')}</p>}
      </div>
    )
  }

  if (done) {
    const correct = scores.reduce((sum, r) => sum + r.correct, 0)
    const total = scores.reduce((sum, r) => sum + r.total, 0)
    const level = levelFor(total ? Math.round((correct / total) * 100) : 0)
    const lv = levelVars(level)
    const course = recommended[level]
    return (
      <div className={s.result}>
        <span className={s.kicker}>{t('resultKicker')}</span>
        <span className={s.bigSticker} style={{ background: lv.bg, color: lv.fg }}>
          {level}
        </span>
        <h1 className={s.resultTitle}>{t.rich(`results.${level}.title`, rich)}</h1>
        <p className={s.introLead}>
          {t(`results.${level}.text`)} {t('score', { correct, total })}.
        </p>
        <div className={s.actions}>
          <Button href={course ? `/${locale}/courses/${course}` : `/${locale}/courses?level=${level}`} size="lg" arrow>
            {course ? t('seeCourse') : t('allCourses')}
          </Button>
          <Button variant="ghost" size="lg" onClick={restart}>
            {t('again')}
          </Button>
        </div>
      </div>
    )
  }

  const sectionChanged = index === 0 || flat[index - 1].sectionIndex !== current.sectionIndex
  const answered = isAnswered(answers[current.question.id])

  return (
    <div className={s.flow}>
      <FocusBar percent={((index + 1) / flat.length) * 100} counter={tq('counter', { current: index + 1, total: flat.length })} closeHref={`/${locale}`} />

      {sections.length > 1 && (
        <span key={current.section.slug} className={s.section}>
          {t('section', { title: current.section.title })}
        </span>
      )}

      {/* A long text is a reading passage to answer from; a short one is just the section intro. */}
      {current.section.content.trim().length > 300 ? (
        <details className={s.passage} open={sectionChanged}>
          <summary>{t('readFirst')}</summary>
          <RichText text={current.section.content} />
        </details>
      ) : (
        current.section.content.trim() && sectionChanged && <p key={`${current.section.slug}-intro`} className={s.sectionIntro}>{current.section.content}</p>
      )}

      <QuestionCard question={current.question} value={answers[current.question.id]} onChange={setAnswer} />

      <div className={s.footer}>
        <p className={[s.error, error && s.errorOn].filter(Boolean).join(' ')} role="alert">
          {error ? tq('sendError') : ''}
        </p>
        <div className={s.buttons}>
          <Button variant="soft" size="lg" onClick={() => advance(true)} disabled={sending}>
            {tq('skip')}
          </Button>
          <Button size="lg" dot onClick={() => advance()} disabled={!answered || sending}>
            {sending ? tq('sending') : tq('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
