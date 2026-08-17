import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2, Lock, Play, Clock, FileText, Video, ListChecks } from 'lucide-react'
import type { TreeLesson } from '@/features/learn/progress'

const STEP_ICON = { video: Video, conspect: FileText, test: ListChecks } as const

export async function LessonCard({
  locale,
  courseSlug,
  lesson
}: {
  locale: string
  courseSlug: string
  lesson: TreeLesson
}) {
  const t = await getTranslations({ locale, namespace: 'learn' })
  const href = `/${locale}/learn/${courseSlug}/${lesson.slug}`
  const locked = lesson.status === 'locked'

  const inner = (
    <>
      <div
        className={`lesson-card__cover${lesson.coverUrl ? ' has-image' : ''}`}
        style={lesson.coverUrl ? { backgroundImage: `url(${lesson.coverUrl})` } : undefined}
      >
        <span className="lesson-card__badge">
          {lesson.status === 'done' && <CheckCircle2 size={15} />}
          {lesson.status === 'current' && <Play size={14} />}
          {locked && <Lock size={14} />}
        </span>

        {lesson.durationMin && (
          <span className="lesson-card__time">
            <Clock size={12} />
            {t('minutes', { count: lesson.durationMin })}
          </span>
        )}
      </div>

      <div className="lesson-card__body">
        <span className="lesson-card__number">{t('lessonNumber', { n: lesson.index })}</span>
        <h3 className="lesson-card__title">{lesson.title}</h3>

        {locked ? (
          <p className="lesson-card__hint">
            {lesson.blockedByTitle
              ? t('lockedAfter', { title: lesson.blockedByTitle })
              : t('statusLocked')}
          </p>
        ) : (
          <div className="lesson-card__steps">
            {lesson.steps.map(step => {
              const Icon = STEP_ICON[step]
              return (
                <span key={step} className="lesson-card__step">
                  <Icon size={13} />
                </span>
              )
            })}
          </div>
        )}
      </div>
    </>
  )

  if (locked) {
    return <div className="lesson-card is-locked">{inner}</div>
  }

  return (
    <Link href={href} className={`lesson-card status-${lesson.status}`}>
      {inner}
    </Link>
  )
}
