'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'

export default function FAQSection() {
  const t = useTranslations('home')
  const locale = useLocale()
  const [open, setOpen] = useState<number | null>(0)

  const faqs = [
    { q: t('fq1'), a: t('fa1') },
    { q: t('fq2'), a: t('fa2') },
    { q: t('fq3'), a: t('fa3') },
    { q: t('fq4'), a: t('fa4') },
    { q: t('fq5'), a: t('fa5') },
    { q: t('fq6'), a: t('fa6') },
    { q: t('fq7'), a: t('fa7') }
  ]

  return (
    <Section id="faq" title={t('faqTitle')} subtitle={t('faqLead')} width="narrow">
      <div className="faq-root">
        {faqs.map((item, i) => {
          const isOpen = open === i
          return (
            <Reveal key={i} delay={Math.min(i, 4) * 0.06} className={`faq-item${isOpen ? ' open' : ''}`}>
              <button className="faq-trigger" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                <span className="faq-title">{item.q}</span>
                <ChevronDown size={18} className={`faq-caret${isOpen ? ' rot' : ''}`} />
              </button>
              <div className="faq-answer">
                <p className="faq-answer-text">{item.a}</p>
              </div>
            </Reveal>
          )
        })}
      </div>

      <p className="section-sub" style={{ textAlign: 'center', marginTop: '2rem' }}>
        {t('faqMore')}{' '}
        <a href={`/${locale}/contacts`}>{t('faqContact')}</a>
      </p>
    </Section>
  )
}
