'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function WhyUs() {
  const reasons = [
    'No overpriced courses draining your wallet',
    'Transparent pricing — no hidden fees or upsells',
    'IELTS 8.0 certified teacher who actually teaches',
    'Study with or without a tutor — your choice',
    'Live streams for Q&A and speaking practice',
    'Free mock tests and level assessments',
    'Speaking clubs to practice with real people',
    'Video lessons, notes, and interactive tests',
    'Community support — not just a transaction',
    'Learn at your own pace without pressure',
  ];

  return (
    <section style={{ padding: '6rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
            Why Choose Deluxe Edu?
          </h2>
          <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
            Because we're not here to <strong style={{ color: '#ef4444' }}>rob you</strong>. We're here to{' '}
            <strong style={{ color: 'var(--gold)' }}>empower you</strong>.
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