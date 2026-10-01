'use client'

import type { CSSProperties } from 'react'
import { useTranslations } from 'next-intl'
import { Phone, Send, Clock, MapPin, MessageCircle } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'
import { CONTACTS } from '@/content/contacts'

export function ContactMethods() {
  const t = useTranslations('contacts')

  const methods = [
    {
      icon: Phone,
      title: t('callTitle'),
      value: CONTACTS.phoneDisplay,
      link: `tel:${CONTACTS.phoneE164}`,
      desc: t('callHint'),
      action: t('callCta'),
      accent: 'var(--accent-green)'
    },
    {
      icon: Send,
      title: t('tgTitle'),
      value: `@${CONTACTS.telegram}`,
      link: `https://t.me/${CONTACTS.telegram}`,
      desc: t('tgHint'),
      action: t('tgCta'),
      accent: 'var(--accent-cyan)'
    }
  ]

  const facts = [
    { icon: Clock, label: t('hours'), value: t('hoursValue') },
    { icon: MapPin, label: t('location'), value: t('locationValue') },
    { icon: MessageCircle, label: t('responseTime'), value: t('responseValue') }
  ]

  return (
    <Section
      id="contact-methods"
      tone="plain"
      texture="grid"
      accent="var(--accent-green)"
      title={t('methodsTitle')}
      subtitle={t('methodsLead')}
    >
      <div className="contact-grid">
        {methods.map((method, index) => {
          const Icon = method.icon
          return (
            <Reveal
              key={method.title}
              delay={index * 0.08}
              style={{ '--accent': method.accent } as CSSProperties}
            >
              <a className="contact-card" href={method.link}>
                <span className="contact-card__icon">
                  <Icon size={20} />
                </span>
                <h3 className="contact-card__title">{method.title}</h3>
                <p className="contact-card__value">{method.value}</p>
                <p className="contact-card__desc">{method.desc}</p>
                <span className="contact-card__action">{method.action}</span>
              </a>
            </Reveal>
          )
        })}
      </div>

      <ul className="contact-facts">
        {facts.map(fact => {
          const Icon = fact.icon
          return (
            <li key={fact.label}>
              <Icon size={18} aria-hidden="true" />
              <div>
                <span className="contact-facts__label">{fact.label}</span>
                <span className="contact-facts__value">{fact.value}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
