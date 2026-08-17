'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { BookOpen, Video, MessageCircle, Award } from 'lucide-react';

export function HowItWorks() {
  const t = useTranslations('about');
  const steps = [
    {
      icon: BookOpen,
      title: t('h1t'),
      desc: t('h1d'),
    },
    {
      icon: Video,
      title: t('h2t'),
      desc: t('h2d'),
    },
    {
      icon: MessageCircle,
      title: t('h3t'),
      desc: t('h3d'),
    },
    {
      icon: Award,
      title: t('h4t'),
      desc: t('h4d'),
    },
  ];

  return (
    <section className="vx-band about-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto 4rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
            {t('howTitle')}
          </h2>
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>
            {t('howLead')}
          </p>
        </motion.div>

        <div className="about-grid-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel"
              style={{ padding: '2rem', position: 'relative' }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-1rem',
                  right: '1.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  color: 'var(--bg)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: '800',
                  fontSize: '1.25rem',
                }}
              >
                {i + 1}
              </div>

              <step.icon size={40} color="var(--gold)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--fg)' }}>
                {step.title}
              </h3>
              <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}