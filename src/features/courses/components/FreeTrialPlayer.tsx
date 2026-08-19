'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileText, ListChecks, Video, X } from 'lucide-react'
import LeadForm from '@/features/leads/LeadForm'
import { RichText } from '@/features/ui/components/RichText'
import { VideoStep } from './lesson-steps/VideoStep'
import { FreeTest, type FreeTestResult } from './FreeTest'

export type TrialLesson = {
  id: string
  slug: string
  title: string
  content: string
  videoUrl: string | null
  hasVideo: boolean
  hasConspect: boolean
  hasTest: boolean
  prompt: unknown | null
}

type Props = {
  lessons: TrialLesson[]
  courseTitle: string
  locale: string
}

type Step = 'video' | 'conspect' | 'test'

const STEP_META = {
  video: { icon: Video, key: 'video' },
  conspect: { icon: FileText, key: 'notes' },
  test: { icon: ListChecks, key: 'test' }
} as const

function stepsOf(lesson: TrialLesson): Step[] {
  const steps: Step[] = []
  if (lesson.hasVideo) steps.push('video')
  if (lesson.hasConspect && lesson.content.trim()) steps.push('conspect')
  if (lesson.hasTest && lesson.prompt) steps.push('test')
  return steps.length ? steps : ['conspect']
}

// Пробный урок — тот же урок, что и в платном курсе: шаги берутся из флагов
// урока, видео и конспект из его полей, тест из задания. Всё правится в
// админке, в компоненте нет ни одного зашитого текста про английский.
export function FreeTrialPlayer({ lessons, courseTitle, locale }: Props) {
  const t = useTranslations('lesson')
  const tFree = useTranslations('free')
  const tLead = useTranslations('lead')
  const tButtons = useTranslations('buttons')

  const [lessonIndex, setLessonIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [testResult, setTestResult] = useState<FreeTestResult | null>(null)
  const [showLead, setShowLead] = useState(false)

  const lesson = lessons[lessonIndex]
  const steps = stepsOf(lesson)
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const isLastStep = stepIndex >= steps.length - 1
  const nextLesson = lessons[lessonIndex + 1]

  const goToLesson = (index: number) => {
    setLessonIndex(index)
    setStepIndex(0)
    setTestResult(null)
  }

  return (
    <div className="page-start py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="trial-banner">
          <div>
            <div className="trial-banner__title">{tFree('trialTitle')}</div>
            <p className="trial-banner__text">{tFree('trialLead')}</p>
          </div>
          <button type="button" onClick={() => setShowLead(true)} className="btn btn-primary">
            {tLead('submit')}
          </button>
        </div>

        {lessons.length > 1 && (
          <nav className="trial-lessons" aria-label={courseTitle}>
            {lessons.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToLesson(index)}
                className={`trial-lesson${index === lessonIndex ? ' current' : ''}`}
              >
                <span className="trial-lesson__num">{index + 1}</span>
                {item.title}
              </button>
            ))}
          </nav>
        )}

        {steps.length > 1 && (
          <nav className="lesson-steps" aria-label={lesson.title}>
            {steps.map((item, index) => {
              const Icon = STEP_META[item].icon
              const isCurrent = index === stepIndex
              const isDone = index < stepIndex
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStepIndex(index)}
                  className={`lesson-step${isCurrent ? ' current' : ''}${isDone ? ' done' : ''}`}
                >
                  <span className="lesson-step__icon">
                    {isDone ? <Check size={14} /> : <Icon size={14} />}
                  </span>
                  <span className="lesson-step__label">{t(STEP_META[item].key)}</span>
                </button>
              )
            })}
          </nav>
        )}

        {step === 'video' && (
          <VideoStep lessonId={lesson.id} locale={locale} videoUrl={lesson.videoUrl} track={false} />
        )}

        {step === 'conspect' &&
          (lesson.content.trim() ? (
            <div className="conspect">
              <RichText text={lesson.content} />
            </div>
          ) : (
            <div className="test-empty">
              <FileText size={40} />
              <h3>{t('notesEmptyTitle')}</h3>
              <p>{t('notesEmptyText')}</p>
            </div>
          ))}

        {step === 'test' &&
          (testResult ? (
            <div className="test-result passed">
              <span className="test-result__icon">
                <CheckCircle2 size={40} />
              </span>
              <h2 className="test-result__title">{tFree('testDone')}</h2>
              <div className="test-result__score">
                {testResult.correct}/{testResult.total}
              </div>
              <p className="test-result__text">{tFree('testDoneText')}</p>
            </div>
          ) : (
            <FreeTest
              courseSlug="trial-lesson"
              lessonSlug={lesson.slug}
              prompt={lesson.prompt}
              locale={locale}
              submitLabel={tFree('completeSection')}
              onScored={setTestResult}
            />
          ))}

        {steps.length > 1 && (
          <div className="test-nav">
            <button
              type="button"
              onClick={() => setStepIndex(index => Math.max(0, index - 1))}
              disabled={stepIndex === 0}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              {tButtons('back')}
            </button>

            {!isLastStep && (
              <button
                type="button"
                onClick={() => setStepIndex(index => index + 1)}
                className="btn btn-primary test-nav__next"
              >
                {t(STEP_META[steps[stepIndex + 1]].key)}
                <ArrowRight size={16} />
              </button>
            )}

            {isLastStep && nextLesson && (
              <button
                type="button"
                onClick={() => goToLesson(lessonIndex + 1)}
                className="btn btn-primary test-nav__next"
              >
                {t('nextLesson')}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        <div className="trial-cta">
          <h3 className="trial-cta__title">{tFree('whatsNext')}</h3>
          <p className="trial-cta__text">{tFree('whatsNextText')}</p>

          <ul className="trial-cta__list">
            <li>{tFree('featVideo')}</li>
            <li>{tFree('featNotes')}</li>
            <li>{tFree('featTests')}</li>
            <li>{tFree('featProgress')}</li>
          </ul>

          <div className="trial-cta__actions">
            <button type="button" onClick={() => setShowLead(true)} className="btn btn-primary">
              {tLead('submit')}
            </button>
            <Link href={`/${locale}/courses`} className="btn btn-secondary">
              {tFree('backToCourses')}
            </Link>
          </div>
        </div>
      </div>

      {showLead && (
        <div className="modal-backdrop" onClick={() => setShowLead(false)}>
          <div className="modal-card" onClick={event => event.stopPropagation()}>
            <div className="modal-card__head">
              <div>
                <h3 className="modal-card__title">{tLead('title')}</h3>
                <p className="modal-card__sub">{courseTitle}</p>
              </div>
              <button type="button" onClick={() => setShowLead(false)} className="modal-card__close">
                <X size={20} />
              </button>
            </div>

            <LeadForm source="TRIAL_LESSON" />
          </div>
        </div>
      )}
    </div>
  )
}
