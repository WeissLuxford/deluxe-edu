'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'

export function FAQPreview() {
  const t = useTranslations('contacts')
  const base = `/${useLocale()}`

  const faqs = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') }
  ]

  return (
    <Section
      tone="raised"
      texture="wash"
      accent="var(--accent-cyan)"
      title={t('faqTitle')}
      subtitle={t('faqLead')}
      width="narrow"
    >
      {/* Здесь ответы открыты сразу, в отличие от аккордеона на главной: это
          короткая выжимка на четыре вопроса, прятать её не за чем. */}
      <div className="faq-preview">
        {faqs.map((faq, index) => (
          <Reveal as="article" key={faq.q} delay={index * 0.06} className="faq-preview__item">
            <h3 className="faq-preview__q">{faq.q}</h3>
            <p className="faq-preview__a">{faq.a}</p>
          </Reveal>
        ))}
      </div>

      <div className="page-actions">
        <ArrowLinkButton href={`${base}#faq`}>{t('faqAll')}</ArrowLinkButton>
      </div>
    </Section>
  )
}
