'use client';

import { useTranslations } from 'next-intl';

import { Award, Heart } from 'lucide-react';

export function OurTeam() {
  const t = useTranslations('about');
  return (
    <section id="team">
      <h2>{t('teamTitle')}</h2>
      <p>{t('teamLead')}</p>

      <div>
        <div>
          <div>Co</div>
          <h3>{t('roleFounder')}</h3>
          <p>{t('roleVisionary')}</p>
          <p>{t('bioFounder')}</p>
        </div>

        <div>
          <div>T</div>
          <h3>{t('roleTeacher')}</h3>
          <span>IELTS 8.0</span>
          <span>{t('tCertified')}</span>
          <p>{t('bioTeacher')}</p>

          <div>
            <Award size={24} />
            <p>{t('tExpert')}</p>
          </div>
          <div>
            <Heart size={24} />
            <p>{t('tCaring')}</p>
          </div>
        </div>
      </div>

      <p>{t('teamNote')}</p>
    </section>
  );
}
