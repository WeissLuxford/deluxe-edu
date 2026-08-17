'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import { MediaDecor } from '@/features/ui/components/MediaDecor';

export function ContactHero() {
  const t = useTranslations('contacts');
  return (
    <section className="vx-band vx-band--accent about-hero" style={{ position: 'relative', overflow: 'hidden' }}>
      <MediaDecor slot="contacts.hero.side" side="left" size="md" />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(199,164,90,0.15)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 2rem',
            }}
          >
            <MessageCircle size={40} color="var(--gold)" />
          </motion.div>

          <h1
            className="hero-title"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('heroTitle')}
          </h1>

          <p className="text-muted" style={{ fontSize: '1.3rem', lineHeight: '1.7', marginBottom: '2rem' }}>
            {t('heroLead')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#contact-methods" className="iridescent">
              {t('ctaContact')}
            </a>
            <a href="/trial-lesson" className="btn-secondary">
              {t('ctaTrial')}
            </a>
          </div>
        </motion.div>
      </div>

      <div className="hero-glow" />
    </section>
  );
}