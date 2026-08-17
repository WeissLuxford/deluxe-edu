'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight, CheckCircle, Check, Video, FileText, ListChecks } from 'lucide-react'
import { localized } from '@/lib/localized'
import { VideoStep } from './lesson-steps/VideoStep'
import { ConspectStep } from './lesson-steps/ConspectStep'
import { TestStep } from './lesson-steps/TestStep'

type Step = 'video' | 'conspect' | 'test'

type Lesson = {
  id: string
  slug: string
  title: any
  content: any
  videoUrl?: string | null
  hasVideo: boolean
  hasConspect: boolean
  hasTest: boolean
}

type Props = {
  lesson: Lesson
  courseSlug: string
  moduleTitle: string
  lessonIndex: number
  assignment: { id: string; title: any; prompt: any } | null
  progress: { watched: boolean; passed: boolean }
  nextLessonSlug: string | null
  initialStep: Step | null
  enrollmentPlan: string
  locale: string
}

const STEP_META = {
  video: { icon: Video, key: 'video' },
  conspect: { icon: FileText, key: 'notes' },
  test: { icon: ListChecks, key: 'test' }
} as const

export function LessonPlayer({
  lesson,
  courseSlug,
  moduleTitle,
  lessonIndex,
  assignment,
  progress,
  nextLessonSlug,
  initialStep,
  enrollmentPlan,
  locale
}: Props) {
  const t = useTranslations('lesson')
  const tButtons = useTranslations('buttons')
  const tLearn = useTranslations('learn')
  const router = useRouter()

  const steps: Step[] = []
  if (lesson.hasVideo) steps.push('video')
  if (lesson.hasConspect) steps.push('conspect')
  if (lesson.hasTest) steps.push('test')

  const startIndex = initialStep && steps.includes(initialStep) ? steps.indexOf(initialStep) : 0

  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex)
  const [visited, setVisited] = useState<Set<Step>>(new Set(steps.slice(0, startIndex + 1)))
  const [testCompleted, setTestCompleted] = useState(progress.passed)
  const [finishing, setFinishing] = useState(false)
  const reportedStep = useRef<Step | null>(null)

  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1
  const conspectStepIndex = steps.indexOf('conspect')
  const hasGradedTest = Boolean(assignment)
  const canGoNext = currentStep !== 'test' || testCompleted

  const title = localized(lesson.title, locale)
  const content = localized(lesson.content, locale)
  const courseHref = `/${locale}/learn/${courseSlug}`

  useEffect(() => {
    if (!currentStep || reportedStep.current === currentStep) return
    reportedStep.current = currentStep
    setVisited(prev => new Set(prev).add(currentStep))

    fetch('/api/lessons/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: lesson.id, step: currentStep })
    }).catch(() => {})
  }, [currentStep, lesson.id])

  const goToNextLesson = () => {
    router.push(nextLessonSlug ? `${courseHref}/${nextLessonSlug}` : courseHref)
    router.refresh()
  }

  const handleNext = async () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1)
      return
    }

    if (!hasGradedTest && !progress.passed) {
      setFinishing(true)
      try {
        await fetch('/api/lessons/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: lesson.id })
        })
      } finally {
        setFinishing(false)
      }
    }

    goToNextLesson()
  }

  return (
    <div className="lesson-player">
      <header className="lesson-player__head">
        <div className="lesson-player__meta">
          <span className="lesson-player__module">{moduleTitle}</span>
          <h1 className="lesson-player__title">{title}</h1>
        </div>
        <span className="lesson-player__number">{tLearn('lessonNumber', { n: lessonIndex })}</span>
      </header>

      {steps.length > 1 && (
        <nav
          className="lesson-steps"
          aria-label={t('stepOf', { current: currentStepIndex + 1, total: steps.length })}
        >
          {steps.map((step, index) => {
            const Icon = STEP_META[step].icon
            const isCurrent = index === currentStepIndex
            const isDone = visited.has(step) && index < currentStepIndex
            const reachable = index <= currentStepIndex || testCompleted

            return (
              <button
                key={step}
                type="button"
                className={`lesson-step${isCurrent ? ' current' : ''}${isDone ? ' done' : ''}`}
                onClick={() => reachable && setCurrentStepIndex(index)}
                disabled={!reachable}
              >
                <span className="lesson-step__icon">
                  {isDone ? <Check size={14} /> : <Icon size={14} />}
                </span>
                <span className="lesson-step__label">{t(STEP_META[step].key)}</span>
              </button>
            )
          })}
        </nav>
      )}

      <div className="lesson-player__body">
        {currentStep === 'video' && (
          <VideoStep lessonId={lesson.id} locale={locale} videoUrl={lesson.videoUrl} />
        )}

        {currentStep === 'conspect' && <ConspectStep content={content} locale={locale} />}

        {currentStep === 'test' && assignment && (
          <TestStep
            assignment={assignment}
            locale={locale}
            enrollmentPlan={enrollmentPlan}
            onComplete={() => setTestCompleted(true)}
            isCompleted={testCompleted}
            onReviewConspect={
              conspectStepIndex >= 0 ? () => setCurrentStepIndex(conspectStepIndex) : undefined
            }
          />
        )}
      </div>

      <div className="lesson-player__nav">
        <button
          type="button"
          onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} />
          {tButtons('back')}
        </button>

        {testCompleted && isLastStep ? (
          <button
            type="button"
            onClick={goToNextLesson}
            className="btn btn-primary lesson-player__forward"
          >
            <CheckCircle size={16} />
            {nextLessonSlug ? t('nextLesson') : t('completeCourse')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext || finishing}
            className="btn btn-primary lesson-player__forward"
          >
            {finishing ? tButtons('saving') : isLastStep ? t('finish') : tButtons('next')}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
