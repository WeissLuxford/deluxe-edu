'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

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
      <div>
        <h2>{t('tiersTitle')}</h2>
        <p>{t('tiersLead')}</p>
      </div>

      <div>
        {tiers.map((tier, i) => (
          <div key={i}>
            <div>
              <div>{tier.title}</div>
              {tier.highlight && <span>{t('tierDeluxe')}</span>}
            </div>

            <p>{tier.desc}</p>

            <div>{t('tierPriceHint')}</div>

            <ul>
              {tier.features.map((feature, idx) => (
                <li key={idx}>
                  <span>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link href={`${base}/courses`}>{t('tierCta')}</Link>
          </div>
        ))}
      </div>

      <div>
        <p>{t('tiersUnsure')}</p>
        <Link href={`${base}/trial-lesson`}>{t('tiersTry')}</Link>
      </div>
    </section>
  )
}
