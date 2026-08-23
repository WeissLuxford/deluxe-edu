'use client';

import { useTranslations } from 'next-intl';

import { BookOpen, Video, MessageCircle, Award } from 'lucide-react';

export function HowItWorks() {
  const t = useTranslations('about');
  const steps = [
    { icon: BookOpen, title: t('h1t'), desc: t('h1d') },
    { icon: Video, title: t('h2t'), desc: t('h2d') },
    { icon: MessageCircle, title: t('h3t'), desc: t('h3d') },
    { icon: Award, title: t('h4t'), desc: t('h4d') }
  ];

  return (
    <section>
      <h2>{t('howTitle')}</h2>
      <p>{t('howLead')}</p>

      <div>
        {steps.map((step, i) => (
          <div key={i}>
            <span>{i + 1}</span>
            <step.icon size={40} />
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
