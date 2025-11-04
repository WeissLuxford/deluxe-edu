// src/features/courses/components/LessonsList.tsx
'use client'

import Link from 'next/link'
import { Lock, CheckCircle, PlayCircle } from 'lucide-react'

type Lesson = {
  id: string
  slug: string
  title: any
  order: number
  hasVideo: boolean
  hasConspect: boolean
  hasTest: boolean
}

type Progress = {
  watched: boolean
  passed: boolean
}

type Props = {
  lessons: Lesson[]
  courseSlug: string
  locale: string
  progressMap: Record<string, Progress>
  isEnrolled: boolean
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

export function LessonsList({ lessons, courseSlug, locale, progressMap, isEnrolled }: Props) {
  const getLessonStatus = (lesson: Lesson, index: number) => {
    if (!isEnrolled) return 'locked'
    
    const progress = progressMap[lesson.id]
    if (progress?.passed) return 'completed'
    
    if (index === 0) return 'available'
    
    const prevLesson = lessons[index - 1]
    const prevProgress = progressMap[prevLesson.id]
    if (prevProgress?.passed) return 'available'
    
    return 'locked'
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson, index) => {
        const status = getLessonStatus(lesson, index)
        const title = getLocalizedText(lesson.title, locale)
        const isLocked = status === 'locked'
        const isCompleted = status === 'completed'
        const isAvailable = status === 'available'

        const contentBadges = []
        if (lesson.hasVideo) contentBadges.push('📹 Video')
        if (lesson.hasConspect) contentBadges.push('📝 Notes')
        if (lesson.hasTest) contentBadges.push('✅ Test')

        return (
          <div
            key={lesson.id}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              opacity: isLocked ? 0.6 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer'
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {/* Status Icon */}
                  <div style={{ color: isCompleted ? '#22c55e' : isAvailable ? 'var(--gold)' : 'var(--muted)' }}>
                    {isCompleted && <CheckCircle size={20} />}
                    {isAvailable && <PlayCircle size={20} />}
                    {isLocked && <Lock size={20} />}
                  </div>

                  {/* Lesson Number & Title */}
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                      Lesson {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
                      {title}
                    </h3>
                  </div>
                </div>

                {/* Content Badges */}
                <div className="flex gap-2 text-xs ml-8" style={{ color: 'var(--muted)' }}>
                  {contentBadges.map((badge, i) => (
                    <span key={i}>{badge}</span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isLocked && !isEnrolled && (
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    Enroll to access
                  </div>
                )}
                {isLocked && isEnrolled && (
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    Complete previous lesson
                  </div>
                )}
                {isAvailable && (
                  <Link
                    href={`/${locale}/courses/${courseSlug}/lessons/${lesson.slug}`}
                    className="btn btn-primary"
                    style={{ background: 'var(--gold)', color: 'var(--bg)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Start Lesson
                  </Link>
                )}
                {isCompleted && (
                  <Link
                    href={`/${locale}/courses/${courseSlug}/lessons/${lesson.slug}`}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Review
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}