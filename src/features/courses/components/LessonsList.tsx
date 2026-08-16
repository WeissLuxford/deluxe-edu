// src/features/courses/components/LessonsList.tsx
'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Lock, CheckCircle2, PlayCircle, Video, FileText, ListChecks } from 'lucide-react'

type Lesson = {
  id: string
  slug: string
  title: any
  order: number
  hasVideo: boolean
  hasConspect: boolean
  hasTest: boolean
}

type Progress = { watched: boolean; passed: boolean }

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
  const t = useTranslations('lesson')

  // Та же лестница, что и на сервере: следующий урок открывается,
  // когда предыдущий пройден
  const statusOf = (lesson: Lesson, index: number) => {
    if (!isEnrolled) return 'locked' as const
    if (progressMap[lesson.id]?.passed) return 'completed' as const
    if (index === 0) return 'available' as const
    return progressMap[lessons[index - 1].id]?.passed ? ('available' as const) : ('locked' as const)
  }

  return (
    <ol className="lesson-list">
      {lessons.map((lesson, index) => {
        const status = statusOf(lesson, index)
        const title = getLocalizedText(lesson.title, locale)
        const href = `/${locale}/courses/${courseSlug}/lessons/${lesson.slug}`

        const parts = [
          lesson.hasVideo && { icon: Video, label: t('video') },
          lesson.hasConspect && { icon: FileText, label: t('notes') },
          lesson.hasTest && { icon: ListChecks, label: t('test') }
        ].filter(Boolean) as { icon: typeof Video; label: string }[]

        return (
          <li key={lesson.id} className={`lesson-row status-${status}`}>
            <span className="lesson-row__icon">
              {status === 'completed' && <CheckCircle2 size={20} />}
              {status === 'available' && <PlayCircle size={20} />}
              {status === 'locked' && <Lock size={18} />}
            </span>

            <div className="lesson-row__body">
              <span className="lesson-row__number">{t('number', { n: index + 1 })}</span>
              <h3 className="lesson-row__title">{title}</h3>

              <div className="lesson-row__parts">
                {parts.map(p => {
                  const Icon = p.icon
                  return (
                    <span key={p.label}>
                      <Icon size={13} />
                      {p.label}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="lesson-row__action">
              {status === 'locked' && (
                <span className="lesson-row__hint">
                  {isEnrolled ? t('completePrevious') : t('enrollToAccess')}
                </span>
              )}
              {status === 'available' && (
                <Link href={href} className="btn btn-primary">
                  {t('startLesson')}
                </Link>
              )}
              {status === 'completed' && (
                <Link href={href} className="btn btn-secondary">
                  {t('reviewLesson')}
                </Link>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
