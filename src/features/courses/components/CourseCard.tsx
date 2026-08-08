// src/features/courses/components/CourseCard.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PlanModal } from './PlanModal'

type CourseCardProps = {
  id: string
  slug: string
  title: string
  description: string
  priceBasic: number
  pricePro: number
  priceDeluxe: number
  lessonsCount: number
  locale: string
  isEnrolled: boolean
  firstLessonSlug?: string
}

export function CourseCard({
  id,
  slug,
  title,
  description,
  priceBasic,
  pricePro,
  priceDeluxe,
  lessonsCount,
  locale,
  isEnrolled,
  firstLessonSlug
}: CourseCardProps) {
  const t = useTranslations('courses')
  const [showPlanModal, setShowPlanModal] = useState(false)

  const handleClick = () => {
    if (isEnrolled && firstLessonSlug) {
      window.location.href = `/${locale}/courses/${slug}/lessons/${firstLessonSlug}`
    } else {
      setShowPlanModal(true)
    }
  }

  const minPrice = Math.min(priceBasic, pricePro, priceDeluxe)
  const isFree = minPrice === 0

  return (
    <>
      <article
        onClick={handleClick}
        className="card card-interactive"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', cursor: 'pointer' }}
      >
        {isEnrolled && <div className="badge badge-primary mb-3">{t('enrolled')}</div>}

        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--fg)' }}>{title}</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)', lineHeight: '1.5' }}>{description}</p>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-col">
            <span className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
              {/* У бесплатного курса «0 сум» выглядит как ошибка, а не как предложение */}
              {isFree
                ? t('free')
                : new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: 'UZS',
                    maximumFractionDigits: 0
                  }).format(minPrice)}
            </span>
            <span className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              {t('lessonsCount', { count: lessonsCount })}
            </span>
          </div>

          <button
            className="btn btn-primary"
            style={{ background: 'var(--gold)', color: 'var(--bg)', padding: '0.625rem 1.25rem' }}
          >
            {isEnrolled ? t('continue') : t('choosePlan')}
          </button>
        </div>
      </article>

      {showPlanModal && (
        <PlanModal
          courseId={id}
          courseSlug={slug}
          courseTitle={title}
          priceBasic={priceBasic}
          pricePro={pricePro}
          priceDeluxe={priceDeluxe}
          locale={locale}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </>
  )
}
