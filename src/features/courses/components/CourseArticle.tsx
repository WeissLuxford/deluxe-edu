// src/features/courses/components/CourseArticle.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react'
import { PlanModal } from './PlanModal'

export type CourseArticleState = 'enrolled' | 'completed' | 'available'

type Props = {
  id: string
  slug: string
  title: string
  description: string
  level: string
  lessonsCount: number
  lessonsDone: number
  priceBasic: number
  pricePro: number
  priceDeluxe: number
  locale: string
  state: CourseArticleState
  /** Урок, с которого продолжить: первый непройденный */
  resumeLessonSlug?: string
}

export function CourseArticle({
  id,
  slug,
  title,
  description,
  level,
  lessonsCount,
  lessonsDone,
  priceBasic,
  pricePro,
  priceDeluxe,
  locale,
  state,
  resumeLessonSlug
}: Props) {
  const t = useTranslations('courses')
  const [planOpen, setPlanOpen] = useState(false)

  const minPrice = Math.min(priceBasic, pricePro, priceDeluxe)
  const isFree = minPrice === 0
  const percent = lessonsCount > 0 ? Math.round((lessonsDone / lessonsCount) * 100) : 0

  const courseHref = `/${locale}/courses/${slug}`
  const resumeHref = resumeLessonSlug ? `${courseHref}/lessons/${resumeLessonSlug}` : courseHref

  const cta =
    state === 'available'
      ? { label: t('choosePlan'), onClick: () => setPlanOpen(true), href: null }
      : state === 'completed'
        ? { label: t('review'), onClick: null, href: courseHref }
        : { label: lessonsDone > 0 ? t('continue') : t('start'), onClick: null, href: resumeHref }

  return (
    <>
      <article className={`course-article state-${state}`}>
        <header className="course-article__head">
          <span className="course-article__level">{level}</span>
          {state === 'completed' && (
            <span className="badge badge-success course-article__done">
              <CheckCircle2 size={13} />
              {t('completedBadge')}
            </span>
          )}
        </header>

        <h3 className="course-article__title">
          <Link href={courseHref}>{title}</Link>
        </h3>

        <p className="course-article__desc">{description}</p>

        <div className="course-article__meta">
          <span className="course-article__lessons">
            <BookOpen size={14} />
            {t('lessonsCount', { count: lessonsCount })}
          </span>

          {state === 'available' && (
            <span className="course-article__price">
              {isFree
                ? t('free')
                : new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: 'UZS',
                    maximumFractionDigits: 0
                  }).format(minPrice)}
            </span>
          )}
        </div>

        {state !== 'available' && lessonsCount > 0 && (
          <div className="course-article__progress">
            <div className="progress">
              <div className="progress-bar" style={{ width: `${percent}%` }} />
            </div>
            <span className="course-article__progress-text">
              {t('progressOf', { done: lessonsDone, total: lessonsCount })}
            </span>
          </div>
        )}

        {cta.href ? (
          <Link href={cta.href} className="btn btn-primary course-article__cta">
            {cta.label}
            <ArrowRight size={15} />
          </Link>
        ) : (
          <button type="button" onClick={cta.onClick!} className="btn btn-primary course-article__cta">
            {cta.label}
            <ArrowRight size={15} />
          </button>
        )}
      </article>

      {planOpen && (
        <PlanModal
          courseId={id}
          courseSlug={slug}
          courseTitle={title}
          priceBasic={priceBasic}
          pricePro={pricePro}
          priceDeluxe={priceDeluxe}
          locale={locale}
          onClose={() => setPlanOpen(false)}
        />
      )}
    </>
  )
}
