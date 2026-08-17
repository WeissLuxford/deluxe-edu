'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import { PlanModal } from './PlanModal'

type Props = {
  id: string
  slug: string
  title: string
  description: string
  level: string
  lessonsCount: number
  totalMinutes?: number
  coverUrl?: string | null
  badge?: string | null
  priceBasic: number
  pricePro: number
  priceDeluxe: number
  locale: string
}

export function CourseArticle({
  id,
  slug,
  title,
  description,
  level,
  lessonsCount,
  totalMinutes = 0,
  coverUrl,
  badge,
  priceBasic,
  pricePro,
  priceDeluxe,
  locale
}: Props) {
  const t = useTranslations('courses')
  const [planOpen, setPlanOpen] = useState(false)

  const minPrice = Math.min(priceBasic, pricePro, priceDeluxe)
  const isFree = minPrice === 0
  const courseHref = `/${locale}/courses/${slug}`
  const hours = totalMinutes > 0 ? Math.round(totalMinutes / 60) : 0

  return (
    <>
      <article className="course-article" data-level={level}>
        <div
          className={`course-article__cover${coverUrl ? ' has-image' : ''}`}
          style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
        >
          {badge && <span className="course-article__badge">{badge}</span>}
          <span className="course-article__level">{level}</span>
        </div>

        <div className="course-article__body">
          <h3 className="course-article__title">
            <Link href={courseHref}>{title}</Link>
          </h3>

          <p className="course-article__desc">{description}</p>

          <div className="course-article__meta">
            <span>
              <BookOpen size={14} />
              {t('lessonsCount', { count: lessonsCount })}
            </span>
            {hours > 0 && (
              <span>
                <Clock size={14} />
                {hours} ч
              </span>
            )}
          </div>

          <div className="course-article__foot">
            <span className="course-article__price">
              {isFree ? (
                t('free')
              ) : (
                <>
                  <em>{t('from')}</em>
                  {new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: 'UZS',
                    maximumFractionDigits: 0
                  }).format(minPrice)}
                </>
              )}
            </span>

            <button
              type="button"
              onClick={() => setPlanOpen(true)}
              className="btn btn-primary course-article__cta"
            >
              {t('choosePlan')}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
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
