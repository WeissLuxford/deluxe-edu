'use client'

import type { CSSProperties } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpen, Video, MessageCircle, Award } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'
import { SECTION_ACCENTS } from '@/features/ui/lib/palette'

export function HowItWorks() {
  const t = useTranslations('about')

  const steps = [
    { icon: BookOpen, title: t('h1t'), desc: t('h1d') },
    { icon: Video, title: t('h2t'), desc: t('h2d') },
    { icon: MessageCircle, title: t('h3t'), desc: t('h3d') },
    { icon: Award, title: t('h4t'), desc: t('h4d') }
  ]

  return (
    <Section
      tone="plain"
      texture="dots"
      accent="var(--accent-blue)"
      title={t('howTitle')}
      subtitle={t('howLead')}
      width="narrow"
    >
      <ol className="format-steps">
        {steps.map((step, index) => {
          const Icon = step.icon
          const accent = SECTION_ACCENTS[index % SECTION_ACCENTS.length]
          return (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 0.08}
              className="format-step"
              style={
                {
                  '--step-accent': accent,
                  '--step-accent-soft': `color-mix(in srgb, ${accent} 16%, transparent)`
                } as CSSProperties
              }
            >
              <span className="format-step__icon">
                <Icon size={18} />
              </span>
              <div>
                <p className="format-step__title">
                  <span className="format-step__num">0{index + 1}</span>
                  {step.title}
                </p>
                <p className="format-step__text">{step.desc}</p>
              </div>
            </Reveal>
          )
        })}
      </ol>
    </Section>
  )
}
