'use client';

import { useTranslations } from 'next-intl';

import { Check } from 'lucide-react';

export function WhyUs() {
  const t = useTranslations('about');
  const reasons = [
    t('r1'),
    t('r2'),
    t('r3'),
    t('r4'),
    t('r5'),
    t('r6'),
    t('r7'),
    t('r8'),
    t('r9'),
    t('r10'),
  ];

  return (
    <section>
      <h2>{t('whyTitle')}</h2>
      <p>{t('whyLead')}</p>

      <div>
        {reasons.map((reason, i) => (
          <div key={i}>
            <Check size={16} strokeWidth={3} />
            <p>{reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
