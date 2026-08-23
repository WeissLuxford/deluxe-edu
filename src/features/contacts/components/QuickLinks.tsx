'use client';

import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { BookOpen, Video, Calendar, HelpCircle } from 'lucide-react';

export function QuickLinks() {
  const t = useTranslations('contacts');
  const links = [
    { icon: BookOpen, title: t('l1'), desc: t('l1d'), href: '/courses' },
    { icon: Video, title: t('l3'), desc: t('l3d'), href: '/streams' },
    { icon: Calendar, title: t('l2'), desc: t('l2d'), href: '/trial-lesson' },
    { icon: HelpCircle, title: 'FAQ', desc: t('faqTitle'), href: '/#faq' }
  ];

  return (
    <section>
      <h2>{t('quickTitle')}</h2>
      <p>{t('quickLead')}</p>

      <div>
        {links.map((link, i) => (
          <Link key={i} href={link.href}>
            <link.icon size={32} />
            <h3>{link.title}</h3>
            <p>{link.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
