'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { Award, Heart } from 'lucide-react';

export function OurTeam() {
  const t = useTranslations('about');
  return (
    <section id="team" className="vx-band vx-band--raised about-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto 4rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
            {t('teamTitle')}
          </h2>
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>
            {t('teamLead')}
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gap: '3rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel"
            style={{ padding: '2.5rem', textAlign: 'center' }}
          >
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                margin: '0 auto 1.5rem',
                display: 'grid',
                placeItems: 'center',
                fontSize: '3rem',
                fontWeight: '800',
                color: 'var(--bg)',
              }}
            >
              Co
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--fg)' }}>
              {t('roleFounder')}
            </h3>
            <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
              {t('roleVisionary')}
            </p>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              {t('bioFounder')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel"
            style={{ padding: '2.5rem', textAlign: 'center', border: '2px solid var(--gold)' }}
          >
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-600), var(--brand-300))',
                margin: '0 auto 1.5rem',
                display: 'grid',
                placeItems: 'center',
                fontSize: '3rem',
                fontWeight: '800',
                color: 'var(--brand-fg)',
              }}
            >
              T
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--fg)' }}>
              {t('roleTeacher')}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="badge-success">IELTS 8.0</span>
              <span className="badge-primary">{t('tCertified')}</span>
            </div>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              {t('bioTeacher')}
            </p>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Award size={24} color="var(--gold)" style={{ marginBottom: '0.25rem' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{t('tExpert')}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Heart size={24} color="var(--brand)" style={{ marginBottom: '0.25rem' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{t('tCaring')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: '3rem' }}
        >
          <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            {t('teamNote')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}