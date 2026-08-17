'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Video, Calendar, HelpCircle } from 'lucide-react';

export function QuickLinks() {
  const t = useTranslations('contacts');
  const links = [
    {
      icon: BookOpen,
      title: t('l1'),
      desc: t('l1d'),
      href: '/courses',
      color: 'var(--brand)',
    },
    {
      icon: Video,
      title: t('l3'),
      desc: t('l3d'),
      href: '/streams',
      color: 'var(--brand)',
    },
    {
      icon: Calendar,
      title: t('l2'),
      desc: t('l2d'),
      href: '/trial-lesson',
      color: 'var(--brand)',
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      desc: t('faqTitle'),
      href: '/#faq',
      color: 'var(--brand)',
    },
  ];

  return (
    <section className="vx-band vx-band--raised about-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '700px', margin: '0 auto 3rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
            {t('quickTitle')}
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>
            {t('quickLead')}
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {links.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={link.href}
                className="glass-panel"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%',
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `color-mix(in oklab, ${link.color} 14%, transparent)`,
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <link.icon size={32} color={link.color} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--fg)' }}>
                  {link.title}
                </h3>

                <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                  {link.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}