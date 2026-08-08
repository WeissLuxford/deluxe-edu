'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function JoinMovement() {
  return (
    <section style={{ padding: '6rem 0', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="cta-glass"
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '4rem 2rem',
            position: 'relative',
          }}
        >
          <Sparkles
            size={48}
            color="var(--gold)"
            style={{ margin: '0 auto 1.5rem', display: 'block' }}
          />

          <h2
            className="hero-title"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Join the Movement
          </h2>

          <p className="text-muted" style={{ fontSize: '1.2rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>
            Let's destroy the overpriced education system together. Start learning English for{' '}
            <strong style={{ color: 'var(--gold)' }}>$15-20/month</strong> — not $300.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/courses" className="iridescent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Browse Courses <ArrowRight size={20} />
            </Link>
            <Link href="/trial-lesson" className="btn-secondary">
              Try Free Lesson
            </Link>
          </div>

          <p className="text-muted" style={{ fontSize: '0.95rem', marginTop: '2rem' }}>
            No credit card required. No BS. Just education.
          </p>
        </motion.div>
      </div>

      <div className="hero-glow" />
    </section>
  );
}