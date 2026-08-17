'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { MediaDecor } from '@/features/ui/components/MediaDecor';

export function AboutHero() {
  const t = useTranslations('about');
  return (
    <section className="vx-band vx-band--accent about-hero" style={{ position: 'relative', overflow: 'hidden' }}>
      <MediaDecor slot="about.hero.side" side="right" size="lg" />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="badge-primary"
            style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', marginBottom: '1.5rem', display: 'inline-block' }}
          >
            {t('founded')}
          </motion.span>

          <h1
            className="about-hero__title text-gradient"
          >
            {t('heroTitle')}
          </h1>

          <p className="text-muted" style={{ fontSize: '1.3rem', lineHeight: '1.7', marginBottom: '2rem' }}>
            {t('heroLead')}
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <a href="#mission" className="iridescent vx">
              {t('ctaMission')}
            </a>
            <a href="#team" className="btn-secondary">
              {t('ctaTeam')}
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, repeat: Infinity, duration: 2 }}
          style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <ArrowDown size={32} color="var(--gold)" />
        </motion.div>
      </div>

      <div className="hero-glow" />
    </section>
  );
}