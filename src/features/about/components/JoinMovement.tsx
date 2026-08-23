'use client';

import { useLocale, useTranslations } from 'next-intl';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function JoinMovement() {
  const t = useTranslations('about');
  const base = `/${useLocale()}`;
  return (
    <section>
      <Sparkles size={48} />

      <h2>{t('joinTitle')}</h2>

      <p>{t('joinLead')}</p>

      <div>
        <Link href={`${base}/courses`}>
          {t('joinCourses')} <ArrowRight size={18} />
        </Link>
        <Link href={`${base}/trial-lesson`}>{t('joinTrial')}</Link>
      </div>

      <p>{t('joinNote')}</p>
    </section>
  );
}
