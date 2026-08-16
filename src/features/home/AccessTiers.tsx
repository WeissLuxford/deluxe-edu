'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function AccessTiers({ base }: { base: string }) {
  const t = useTranslations('home')
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const [visible, setVisible] = useState<boolean[]>([])

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

  useEffect(() => {
    setVisible(new Array(tiers.length).fill(false))

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setVisible(v => {
              const next = [...v]
              next[index] = true
              return next
            })
          }
        })
      },
      { threshold: 0.3 }
    )

    cardsRef.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [tiers.length])

  return (
    <section id="block-access" data-section="access-tiers" className="relative py-28">
      <div className="access-bg" />
      <div className="container relative z-10">
        <div className="access-head text-center mb-14">
          <h2 className="text-4xl font-bold text-gradient mb-3">{t('tiersTitle')}</h2>
          <p className="text-lg text-muted">{t('tiersLead')}</p>
        </div>

        <div className="access-grid">
          {tiers.map((tier, i) => (
            <div
              key={i}
              ref={el => { cardsRef.current[i] = el }}
              data-index={i}
              className={`vx-tier glass-tier transition-all duration-700 ease-out transform opacity-0 translate-y-8 ${
                visible[i] ? 'opacity-100 translate-y-0' : ''
              } ${tier.highlight ? 'highlight' : ''}`}
              style={{ padding: '2.5rem' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-2xl" style={{ color: 'var(--fg)' }}>{tier.title}</div>
                {tier.highlight && (
                  <span className="badge badge-primary" style={{ padding: '0.5rem 1rem' }}>
                    {t('tierDeluxe')}
                  </span>
                )}
              </div>

              <p className="text-base text-muted mb-6 leading-relaxed">{tier.desc}</p>

              <div className="mb-6">
                <div className="text-sm text-muted">{t('tierPriceHint')}</div>
              </div>

              <div className="divider mb-6" />

              <ul style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
                {tier.features.map((feature, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--gold-text)', fontSize: '1.2rem', lineHeight: '1' }}>✓</span>
                    <span style={{ color: 'var(--fg)' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`${base}/courses`}
                className={tier.highlight ? 'iridescent vx' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {t('tierCta')}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted text-lg mb-4">{t('tiersUnsure')}</p>
          <Link href={`${base}/trial-lesson`} className="btn-secondary">
            {t('tiersTry')}
          </Link>
        </div>
      </div>
    </section>
  )
}
