'use client'

import type { CSSProperties } from 'react'
import { useTranslations } from 'next-intl'
import { DollarSign, Users, Heart, Zap } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'

export function OurMission() {
  const t = useTranslations('about')

  const items = [
    { icon: DollarSign, title: t('m1t'), desc: t('m1d'), accent: 'var(--accent-green)' },
    { icon: Users, title: t('m4t'), desc: t('m4d'), accent: 'var(--accent-blue)' },
    { icon: Heart, title: t('m3t'), desc: t('m3d'), accent: 'var(--accent-violet)' },
    { icon: Zap, title: t('m2t'), desc: t('m2d'), accent: 'var(--accent-amber)' }
  ]

  return (
    <Section
      id="mission"
      tone="plain"
      texture="grid"
      accent="var(--accent-green)"
      title={t('storyTitle')}
    >
      <div className="prose-block">
        <p>{t('story1')}</p>
        <p>{t('story2')}</p>
      </div>

      <div className="fmt-grid">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <Reveal
              as="div"
              key={item.title}
              delay={index * 0.08}
              className="fmt-card-wrap"
              style={{ '--accent': item.accent } as CSSProperties}
            >
              <div className="fmt-card">
                <div className="fmt-card__orbit" aria-hidden="true">
                  <span className="fmt-card__ring" />
                  <span className="fmt-card__ring" />
                  <span className="fmt-card__ring" />
                  <span className="fmt-card__badge">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="fmt-card__body">
                  <span className="fmt-card__num">0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
