// src/features/courses/components/SpecialOffersSection.tsx
'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  PlayCircle,
  Gauge,
  FileCheck2,
  UserRound,
  Check,
  type LucideIcon
} from 'lucide-react'

type Props = {
  hasLevelTest: boolean
  hasFreeMockTest: boolean
  locale: string
}

type Offer = {
  key: string
  icon: LucideIcon
  href: string | null
  badge?: string
  accent?: boolean
  title: string
  desc: string
  points: string[]
  cta: string
}

function OfferCard({ offer }: { offer: Offer }) {
  const Icon = offer.icon

  const body = (
    <>
      <div className="offer-head">
        <span className="offer-icon">
          <Icon size={20} />
        </span>
        {offer.badge && (
          <span className={`badge${offer.accent ? ' badge-primary' : ''}`}>{offer.badge}</span>
        )}
      </div>

      <h3 className="offer-title">{offer.title}</h3>
      <p className="offer-desc">{offer.desc}</p>

      <ul className="offer-points">
        {offer.points.map(p => (
          <li key={p}>
            <Check size={14} />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <span className={`btn ${offer.accent ? 'btn-primary' : 'btn-secondary'} offer-cta`}>
        {offer.cta}
      </span>
    </>
  )

  if (!offer.href) {
    return <div className={`offer-card${offer.accent ? ' accent' : ''}`}>{body}</div>
  }

  return (
    <Link href={offer.href} className={`offer-card${offer.accent ? ' accent' : ''}`}>
      {body}
    </Link>
  )
}

export function SpecialOffersSection({ hasLevelTest, hasFreeMockTest, locale }: Props) {
  const t = useTranslations('offers')

  // Эмодзи заменены на иконки: у эмодзи собственные цвета, они не
  // подчиняются теме и выбивались из золото-чёрной палитры
  const offers: Offer[] = [
    {
      key: 'trial',
      icon: PlayCircle,
      href: `/${locale}/trial-lesson`,
      badge: t('free'),
      title: t('trialTitle'),
      desc: t('trialDesc'),
      points: [t('trialA'), t('trialB'), t('trialC')],
      cta: t('trialCta')
    },
    ...(hasLevelTest
      ? [
          {
            key: 'level',
            icon: Gauge,
            href: `/${locale}/level-test`,
            badge: t('recommended'),
            accent: true,
            title: t('levelTitle'),
            desc: t('levelDesc'),
            points: [t('levelA'), t('levelB'), t('levelC')],
            cta: t('levelCta')
          } as Offer
        ]
      : []),
    ...(hasFreeMockTest
      ? [
          {
            key: 'mock',
            icon: FileCheck2,
            href: `/${locale}/free-mock-test`,
            badge: t('free'),
            title: t('mockTitle'),
            desc: t('mockDesc'),
            points: [t('mockA'), t('mockB'), t('mockC')],
            cta: t('mockCta')
          } as Offer
        ]
      : []),
    {
      key: 'teacher',
      icon: UserRound,
      href: `/${locale}/contacts`,
      badge: t('premium'),
      title: t('teacherTitle'),
      desc: t('teacherDesc'),
      points: [t('teacherA'), t('teacherB'), t('teacherC')],
      cta: t('teacherCta')
    }
  ]

  return (
    <section className="offers-section">
      <div className="section-head">
        <h2 className="section-title">{t('title')}</h2>
        <p className="section-sub">{t('subtitle')}</p>
      </div>

      <div className="offers-grid">
        {offers.map(o => (
          <OfferCard key={o.key} offer={o} />
        ))}
      </div>
    </section>
  )
}
