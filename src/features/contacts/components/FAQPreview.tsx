'use client';

import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';

export function FAQPreview() {
  const t = useTranslations('contacts');
  const faqs = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') }
  ];

  return (
    <section>
      <HelpCircle size={48} />
      <h2>{t('faqTitle')}</h2>
      <p>{t('faqLead')}</p>

      <div>
        {faqs.map((faq, i) => (
          <div key={i}>
            <h4>{faq.q}</h4>
            <p>{faq.a}</p>
          </div>
        ))}
      </div>

      <Link href="/#faq">
        {t('faqAll')} <ArrowRight size={18} />
      </Link>
    </section>
  );
}
