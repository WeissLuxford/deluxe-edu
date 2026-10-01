'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { BookOpen, Video, Calendar, HelpCircle } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'

export function QuickLinks() {
  const t = useTranslations('contacts')
  const base = `/${useLocale()}`

  // Все адреса с префиксом локали: без него ссылки уходили мимо
  // локализованных маршрутов.
  const links = [
    { icon: BookOpen, title: t('l1'), desc: t('l1d'), href: `${base}/courses`, accent: 'var(--accent-blue)' },
    { icon: Video, title: t('l3'), desc: t('l3d'), href: `${base}/streams`, accent: 'var(--accent-violet)' },
    { icon: Calendar, title: t('l2'), desc: t('l2d'), href: `${base}/trial-lesson`, accent: 'var(--accent-green)' },
    { icon: HelpCircle, title: t('faqTitle'), desc: t('faqLead'), href: `${base}#faq`, accent: 'var(--accent-amber)' }
  ]

  return (
    <Section
      tone="plain"
      texture="dots"
      accent="var(--accent-blue)"
      title={t('quickTitle')}
      subtitle={t('quickLead')}
    >
      <div className="quick-grid">
        {links.map((link, index) => {
          const Icon = link.icon
          return (
            <Reveal
              as="div"
              key={link.title}
              delay={index * 0.06}
              style={{ '--accent': link.accent } as CSSProperties}
            >
              <Link href={link.href} className="quick-card">
                <span className="quick-card__icon">
                  <Icon size={20} />
                </span>
                <span className="quick-card__title">{link.title}</span>
                <span className="quick-card__desc">{link.desc}</span>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
