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
    <section id="faq">
      <h2>{t('faqTitle')}</h2>
      <p>{t('faqLead')}</p>
      <div>
        {faqs.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i}>
              <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{item.q}</span>
              </button>
              {isOpen && (
                <div>
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div>
        <p>{t('faqMore')}</p>
        <a href={`/${locale}/contacts`}>{t('faqContact')}</a>
      </div>
    </section>
  )
}
