'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

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
    <section id="faq" className="relative py-24" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gradient">{t('faqTitle')}</h2>
          <p className="text-lg text-muted">{t('faqLead')}</p>
        </div>
        <div className="faq-root" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className={`faq-item glass-panel ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="faq-title">{item.q}</span>
                  <span className={`faq-caret ${isOpen ? 'rot' : ''}`} aria-hidden>▾</span>
                </button>
                <div className={`faq-answer ${isOpen ? 'show' : ''}`}>
                  <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.7' }}>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-center mt-10">
          <p className="text-muted text-lg mb-4">{t('faqMore')}</p>
          <a href={`/${locale}/contacts`} className="btn-secondary">{t('faqContact')}</a>
        </div>
      </div>
    </section>
  )
}
