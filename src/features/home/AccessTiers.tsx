'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { ChunkyButton } from '@/features/ui/components/ChunkyButton'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'
import { Reveal } from '@/features/ui/components/Reveal'

export default function AccessTiers({ base }: { base: string }) {
  const t = useTranslations('home')

  const tiers = [
    {
      title: t('tierBasic'),
      desc: t('tierBasicLead'),
      features: [t('tb1'), t('tb2'), t('tb3'), t('tb4')]
    },
    {
      title: t('tierPro'),
      desc: t('tierProLead'),
      features: [t('tp1'), t('tp2'), t('tp3'), t('tp4')]
    },
    {
      title: t('tierDeluxe'),
      desc: t('tierDeluxeLead'),
      features: [t('td1'), t('td2'), t('td3'), t('td4')],
      highlight: true
    }
  ]

  return (
    <section id="block-access" data-section="access-tiers">
      <div className="container">
        <div className="access-head">
          <h2 className="section-title">{t('tiersTitle')}</h2>
          <p className="section-sub">{t('tiersLead')}</p>
        </div>

        <div className="access-grid">
          {tiers.map((tier, i) => (
            <Reveal key={i} delay={i * 0.08} className={`plan-card${tier.highlight ? ' accent' : ''}`}>
              {tier.highlight && <span className="plan-card__badge">{tier.title}</span>}

              <span className="plan-card__name">{tier.title}</span>
              <p className="plan-card__kind">{tier.desc}</p>
              <p className="plan-card__kind">{t('tierPriceHint')}</p>

              <ul className="plan-card__list">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="plan-card__includes">
                    <Check size={14} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <ChunkyButton href={`${base}/courses`} color={tier.highlight ? 'brand' : 'neutral'} fullWidth>
                {t('tierCta')}
              </ChunkyButton>
            </Reveal>
          ))}
        </div>

        <div className="access-footer">
          <p className="section-sub">{t('tiersUnsure')}</p>
          <ArrowLinkButton href={`${base}/trial-lesson`}>{t('tiersTry')}</ArrowLinkButton>
        </div>
      </div>
    </section>
  )
}
