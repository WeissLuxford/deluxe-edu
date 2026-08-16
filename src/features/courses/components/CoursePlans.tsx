// src/features/courses/components/CoursePlans.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { PlanModal } from './PlanModal'

type Props = {
  courseId: string
  courseSlug: string
  courseTitle: string
  priceBasic: number
  pricePro: number
  priceDeluxe: number
  locale: string
}

export function CoursePlans({
  courseId,
  courseSlug,
  courseTitle,
  priceBasic,
  pricePro,
  priceDeluxe,
  locale
}: Props) {
  const t = useTranslations('course')
  const tCourses = useTranslations('courses')
  const [open, setOpen] = useState(false)

  const money = (value: number) =>
    value === 0
      ? tCourses('free')
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'UZS',
          maximumFractionDigits: 0
        }).format(value)

  // Цены берутся из базы — те, что задаются в админке, а не написаны в вёрстке
  const plans = [
    { key: 'BASIC', name: 'Basic', price: priceBasic, includes: t('planBasic') },
    { key: 'PRO', name: 'Pro', price: pricePro, includes: t('planPro'), accent: true },
    { key: 'DELUXE', name: 'Deluxe', price: priceDeluxe, includes: t('planDeluxe') }
  ]

  return (
    <section>
      <div className="section-head">
        <h2 className="section-title">{t('plansTitle')}</h2>
        <p className="section-sub">{t('plansHint')}</p>
      </div>

      <div className="plans-grid">
        {plans.map(p => (
          <div key={p.key} className={`plan-card${p.accent ? ' accent' : ''}`}>
            <div className="plan-card__name">{p.name}</div>
            <div className="plan-card__price">{money(p.price)}</div>
            <p className="plan-card__includes">
              <Check size={15} />
              <span>{p.includes}</span>
            </p>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary plans-cta">
        {t('choosePlanCta')}
      </button>

      {open && (
        <PlanModal
          courseId={courseId}
          courseSlug={courseSlug}
          courseTitle={courseTitle}
          priceBasic={priceBasic}
          pricePro={pricePro}
          priceDeluxe={priceDeluxe}
          locale={locale}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  )
}
