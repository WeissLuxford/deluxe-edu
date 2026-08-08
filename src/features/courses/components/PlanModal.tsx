// src/features/courses/components/PlanModal.tsx
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

type Plan = {
  id: 'FREE' | 'BASIC' | 'PRO' | 'DELUXE'
  name: string
  price: number
  features: string[]
  popular?: boolean
}

type PlanModalProps = {
  courseId: string
  courseSlug: string
  courseTitle: string
  priceBasic: number
  pricePro: number
  priceDeluxe: number
  locale: string
  onClose: () => void
}

export function PlanModal({ courseId, courseSlug, courseTitle, priceBasic, pricePro, priceDeluxe, locale, onClose }: PlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  const plans: Plan[] = [
    { id: 'FREE', name: 'Trial Lesson', price: 0, features: ['Access to first lesson', 'Video content', 'Basic assignments', 'Self-paced learning'] },
    { id: 'BASIC', name: 'Basic', price: priceBasic, features: ['All video lessons', 'Auto-graded assignments', 'Course certificate', 'Lifetime access'] },
    { id: 'PRO', name: 'Pro', price: pricePro, popular: true, features: ['Everything in Basic', 'Mentor feedback on assignments', 'Priority support via Telegram', 'Code review'] },
    { id: 'DELUXE', name: 'Deluxe', price: priceDeluxe, features: ['Everything in Pro', '1-on-1 mentoring sessions', 'Personalized learning path', 'Career guidance'] }
  ]

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    if (planId === 'FREE') {
      window.location.href = `/${locale}/courses/${courseSlug}/lessons/lesson-1`
    } else {
      setShowContactModal(true)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(price)
  }

  if (showContactModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.7)' }} onClick={onClose}>
        <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-gold)' }} onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold" style={{ color: 'var(--gold)' }}>Contact us to enroll</h3>
            <button onClick={onClose} className="rounded-lg p-2 transition-colors" style={{ border: '1px solid var(--border)', color: 'var(--fg)' }}>
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <p style={{ color: 'var(--muted)' }}>
              To enroll in the <strong style={{ color: 'var(--gold)' }}>{plans.find(p => p.id === selectedPlan)?.name}</strong> plan, please contact us via:
            </p>

            <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Phone</div>
                  <a href="tel:+998901234567" className="text-lg font-semibold" style={{ color: 'var(--gold)' }}>+998 90 123 45 67</a>
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Telegram</div>
                  <a href="https://t.me/deluxeedu" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold" style={{ color: 'var(--gold)' }}>@deluxeedu</a>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(199, 164, 90, 0.1)', color: 'var(--muted)' }}>
              💡 Payment is currently accepted in cash only. Our team will help you with enrollment.
            </div>
          </div>

          <button onClick={onClose} className="btn btn-primary mt-6 w-full" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>Got it</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" style={{ background: 'rgba(0, 0, 0, 0.7)' }} onClick={onClose}>
      <div className="w-full max-w-5xl rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-gold)' }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Choose your plan</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{courseTitle}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors" style={{ border: '1px solid var(--border)', color: 'var(--fg)' }}>
            <X size={24} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.id} className="glass-tier" style={{ borderColor: plan.popular ? 'var(--gold)' : 'var(--border)', position: 'relative' }}>
              {plan.popular && (
                <div className="badge badge-primary" style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)' }}>Most Popular</div>
              )}

              <div className="vx-tier">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{plan.name}</h3>
                  <div className="mt-2 text-3xl font-bold" style={{ color: 'var(--gold)' }}>{formatPrice(plan.price)}</div>
                  {plan.price > 0 && <div className="text-sm" style={{ color: 'var(--muted)' }}>one-time payment</div>}

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg)' }}>
                        <span style={{ color: 'var(--gold)' }}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={plan.popular ? 'iridescent w-full' : 'btn btn-secondary w-full'}
                  style={!plan.popular ? { marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--fg)' } : { marginTop: '1.5rem' }}
                >
                  {plan.id === 'FREE' ? 'Try free' : 'Choose plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg p-4 text-center text-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          All paid plans include lifetime access to course materials
        </div>
      </div>
    </div>
  )
}