'use client'

import type { CSSProperties } from 'react'
import { useTranslations } from 'next-intl'
import { UserPlus, PlayCircle, Radio } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { PLAYFUL_PALETTE } from '@/features/ui/lib/palette'

export default function HowItWorks() {
  const t = useTranslations('home')
  const steps = [
    { n: '1', icon: UserPlus, title: t('w1'), desc: t('w1d') },
    { n: '2', icon: PlayCircle, title: t('w2'), desc: t('w2d') },
    { n: '3', icon: Radio, title: t('w3'), desc: t('w3d') }
  ]

  return (
    <Section id="how-it-works" title={t('howTitle')} subtitle={t('howLead')} width="narrow">
      <ol className="format-steps">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <li
              key={step.n}
              className="format-step"
              style={
                {
                  '--step-accent': PLAYFUL_PALETTE[index % PLAYFUL_PALETTE.length],
                  '--step-accent-soft': `color-mix(in srgb, ${PLAYFUL_PALETTE[index % PLAYFUL_PALETTE.length]} 16%, transparent)`
                } as CSSProperties
              }
            >
              <span className="format-step__icon">
                <Icon size={18} />
              </span>
              <div>
                <p className="format-step__title">
                  <span className="format-step__num">0{step.n}</span>
                  {step.title}
                </p>
                <p className="format-step__text">{step.desc}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
