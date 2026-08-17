'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function WhyUs() {
  const t = useTranslations('about');
  const reasons = [
    t('r1'),
    t('r2'),
    t('r3'),
    t('r4'),
    t('r5'),
    t('r6'),
    t('r7'),
    t('r8'),
    t('r9'),
    t('r10'),
  ];

  return (
    <section className="vx-band vx-band--raised about-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
            {t('whyTitle')}
          </h2>
          <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
            {t('whyLead')}
          </p>

          <div
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              display: 'grid',
              gap: '1.25rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              textAlign: 'left',
            }}
          >
            {reasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={16} color="var(--bg)" strokeWidth={3} />
                </div>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.5', color: 'var(--fg)' }}>{reason}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}