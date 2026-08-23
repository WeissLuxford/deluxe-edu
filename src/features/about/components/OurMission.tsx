'use client';

import { useTranslations } from 'next-intl';

import { DollarSign, Users, Heart, Zap } from 'lucide-react';

export function OurMission() {
  const t = useTranslations('about');
  const items = [
    { icon: DollarSign, title: t('m1t'), desc: t('m1d') },
    { icon: Users, title: t('m4t'), desc: t('m4d') },
    { icon: Heart, title: t('m3t'), desc: t('m3d') },
    { icon: Zap, title: t('m2t'), desc: t('m2d') }
  ];

  return (
    <section id="mission">
      <h2>{t('storyTitle')}</h2>
      <p>{t('story1')}</p>
      <p>{t('story2')}</p>

      <div>
        {items.map((item, i) => (
          <div key={i}>
            <item.icon size={30} strokeWidth={1.6} />
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
