'use client';

import { useTranslations } from 'next-intl';

export function AboutHero() {
  const t = useTranslations('about');
  return (
    <section>
      <span>{t('founded')}</span>

      <h1>{t('heroTitle')}</h1>

      <p>{t('heroLead')}</p>

      <div>
        <a href="#mission">{t('ctaMission')}</a>
        <a href="#team">{t('ctaTeam')}</a>
      </div>
    </section>
  );
}
