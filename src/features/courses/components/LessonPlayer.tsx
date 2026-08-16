'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { VideoStep } from './lesson-steps/VideoStep'
import { ConspectStep } from './lesson-steps/ConspectStep'
import { TestStep } from './lesson-steps/TestStep'

type Lesson = {
  id: string
  slug: string
  title: any
  content: any
  hasVideo: boolean
  hasConspect: boolean
  hasTest: boolean
}

type Assignment = {
  id: string
  title: any
  prompt: any
} | null

type Progress = {
  watched: boolean
  passed: boolean
} | null

type Props = {
  lesson: Lesson
  course: any
  assignment: Assignment
  progress: Progress
  nextLesson: any
  enrollmentPlan: string
  locale: string
}

function getLocalizedText(value: any, locale: string) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value[locale]) return value[locale]
    const first = Object.values(value)[0]
    return typeof first === 'string' ? first : ''
  }
  return ''
}

export function LessonPlayer({ lesson, course, assignment, progress, nextLesson, enrollmentPlan, locale }: Props) {
  const steps: ('video' | 'conspect' | 'test')[] = []
  if (lesson.hasVideo) steps.push('video')
  if (lesson.hasConspect) steps.push('conspect')
  if (lesson.hasTest) steps.push('test')

  const t = useTranslations('lesson')
  const tButtons = useTranslations('buttons')

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [testCompleted, setTestCompleted] = useState(progress?.passed || false)
  const [finishing, setFinishing] = useState(false)

  const hasGradedTest = Boolean(assignment)

  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1
  const conspectStepIndex = steps.indexOf('conspect')
  const canGoNext = currentStep === 'video' || currentStep === 'conspect' || testCompleted

  const title = getLocalizedText(lesson.title, locale)
  const content = getLocalizedText(lesson.content, locale)

  const handleNext = async () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1)
      return
    }

    if (!hasGradedTest && !progress?.passed) {
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

    window.location.href = nextLesson
      ? `/${locale}/courses/${course.slug}/lessons/${nextLesson.slug}`
      : `/${locale}/courses/${course.slug}`
  }

  const handleTestComplete = () => {
    setTestCompleted(true)
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-10" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="page-start">
          <div className="flex items-center justify-between py-4">
            <Link href={`/${locale}/courses/${course.slug}`} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              <ArrowLeft size={16} />
              <span>{t('backToCourse')}</span>
            </Link>

            <div className="text-center flex-1">
              <h1 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{title}</h1>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                {t('stepOf', { current: currentStepIndex + 1, total: steps.length })}
              </div>
            </div>

            <div className="w-24" />
          </div>

          <div className="progress" style={{ height: '4px', marginBottom: 0 }}>
            <div className="progress-bar" style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="page-start py-8">
        <div className="mx-auto max-w-4xl">
          {currentStep === 'video' && (
            <VideoStep
              lessonId={lesson.id}
              locale={locale}
            />
          )}

          {currentStep === 'conspect' && (
            <ConspectStep
              content={content}
              locale={locale}
            />
          )}

          {currentStep === 'test' && assignment && (
            <TestStep
              assignment={assignment}
              locale={locale}
              enrollmentPlan={enrollmentPlan}
              onComplete={handleTestComplete}
              isCompleted={testCompleted}
              onReviewConspect={
                conspectStepIndex >= 0
                  ? () => setCurrentStepIndex(conspectStepIndex)
                  : undefined
              }
            />
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="btn btn-secondary"
              style={{ opacity: currentStepIndex === 0 ? 0.5 : 1 }}
            >
              <ArrowLeft size={16} />
              {tButtons('back')}
            </button>

            {testCompleted && isLastStep ? (
              <button onClick={handleNext} disabled={finishing} className="btn btn-primary flex items-center gap-2" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                <CheckCircle size={16} />
                {nextLesson ? t('nextLesson') : t('completeCourse')}
              </button>
            ) : (
              <button onClick={handleNext} disabled={!canGoNext || finishing} className="btn btn-primary flex items-center gap-2" style={{ background: 'var(--gold)', color: 'var(--bg)', opacity: canGoNext ? 1 : 0.5 }}>
                {finishing ? tButtons('saving') : isLastStep ? t('finish') : tButtons('next')}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}