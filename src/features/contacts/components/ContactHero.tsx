'use client';

import { useTranslations } from 'next-intl';

import { MessageCircle } from 'lucide-react';

export function ContactHero() {
  const t = useTranslations('contacts');
  return (
    <section>
      <MessageCircle size={40} />

      <h1>{t('heroTitle')}</h1>

      <p>{t('heroLead')}</p>

      <div>
        <a href="#contact-methods">{t('ctaContact')}</a>
        <a href="/trial-lesson">{t('ctaTrial')}</a>
      </div>
    </section>
  );
}
