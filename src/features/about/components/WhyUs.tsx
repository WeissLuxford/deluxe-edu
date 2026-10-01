'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'

export function WhyUs() {
  const t = useTranslations('about')

  const reasons = [
    t('r1'), t('r2'), t('r3'), t('r4'), t('r5'),
    t('r6'), t('r7'), t('r8'), t('r9'), t('r10')
  ]

  return (
    <Section
      tone="raised"
      texture="wash"
      accent="var(--accent-cyan)"
      title={t('whyTitle')}
      subtitle={t('whyLead')}
    >
      <ul className="reason-grid">
        {reasons.map((reason, index) => (
          <Reveal
            as="li"
            key={reason}
            /* Волна затухает после пятого пункта: десять нарастающих задержек
               подряд читаются как подтормаживание страницы, а не как анимация. */
            delay={Math.min(index, 5) * 0.06}
            className="reason-item"
          >
            <span className="reason-item__check" aria-hidden="true">
              <Check size={14} strokeWidth={3} />
            </span>
            <span>{reason}</span>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
