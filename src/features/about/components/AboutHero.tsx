'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export function AboutHero() {
  return (
    <section className="hero-gradient" style={{ padding: '6rem 0 4rem', position: 'relative', overflow: 'hidden' }}>
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
            Founded in 2025
          </motion.span>

          <h1
            className="hero-title"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Education Should Be Accessible, Not a Luxury
          </h1>

          <p className="text-muted" style={{ fontSize: '1.3rem', lineHeight: '1.7', marginBottom: '2rem' }}>
            We're here to <strong style={{ color: 'var(--gold)' }}>disrupt the overpriced English learning industry</strong> in
            Uzbekistan and make quality education available to everyone — not just the wealthy.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <a href="#mission" className="iridescent">
              Our Mission
            </a>
            <a href="#team" className="btn-secondary">
              Meet the Team
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, repeat: Infinity, duration: 2 }}
          style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <ArrowDown size={32} color="var(--gold)" />
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className="hero-glow" />
    </section>
  );
}