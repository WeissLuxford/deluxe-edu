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
  currentPlan?: string | null
}

const PLAN_RANK: Record<string, number> = { FREE: 0, BASIC: 1, PRO: 2, DELUXE: 3 }

export function CoursePlans({
  courseId,
  courseSlug,
  courseTitle,
  priceBasic,
  pricePro,
  priceDeluxe,
  locale,
  currentPlan = null
}: Props) {
  const t = useTranslations('course')
  const tCourses = useTranslations('courses')
  const tLearn = useTranslations('learn')
  const [open, setOpen] = useState(false)
  const ownedRank = currentPlan ? (PLAN_RANK[currentPlan] ?? -1) : -1

  const money = (value: number) =>
    value === 0
      ? tCourses('free')
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'UZS',
          maximumFractionDigits: 0
        }).format(value)

  const plans = [
    {
      key: 'BASIC',
      name: 'Basic',
      price: priceBasic,
      includes: t('planBasic'),
      kind: t('planSelfPaced')
    },
    {
      key: 'PRO',
      name: 'Pro',
      price: pricePro,
      includes: t('planPro'),
      kind: t('planSelfPaced')
    },
    {
      key: 'DELUXE',
      name: 'Deluxe',
      price: priceDeluxe,
      includes: t('planDeluxe'),
      kind: t('planWithTeacher'),
      accent: true,
      badge: t('planPopular')
    }
  ]

  return (
    <section>
      <div className="section-head">
        <h2 className="section-title">{t('plansTitle')}</h2>
        <p className="section-sub">{t('plansHint')}</p>
      </div>

      <div className="plans-grid">
        {plans.map(p => {
          const rank = PLAN_RANK[p.key] ?? 0
          const owned = ownedRank === rank
          const below = ownedRank >= 0 && rank < ownedRank

          return (
            <div
              key={p.key}
              className={`plan-card${p.accent && !below ? ' accent' : ''}${owned ? ' owned' : ''}${below ? ' muted' : ''}`}
            >
              {owned ? (
                <span className="plan-card__badge">{tLearn('yourPlan')}</span>
              ) : (
                p.badge && !below && <span className="plan-card__badge">{p.badge}</span>
              )}
              <div className="plan-card__name">{p.name}</div>
              <div className="plan-card__kind">{p.kind}</div>
              <div className="plan-card__price">{money(p.price)}</div>
              <p className="plan-card__includes">
                <Check size={15} />
                <span>{p.includes}</span>
              </p>
            </div>
          )
        })}
      </div>

      {ownedRank < PLAN_RANK.DELUXE && (
        <button type="button" onClick={() => setOpen(true)} className="btn btn-primary plans-cta">
          {ownedRank >= 0 ? tLearn('upgradePlan') : t('choosePlanCta')}
        </button>
      )}

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
