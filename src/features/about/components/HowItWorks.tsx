'use client';

import { motion } from 'framer-motion';
import { BookOpen, Video, MessageCircle, Award } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: BookOpen,
      title: 'Choose Your Path',
      desc: 'Study solo with video lessons & notes, or get 1-on-1 mentorship. Both are affordable.',
    },
    {
      icon: Video,
      title: 'Watch & Practice',
      desc: 'High-quality video lessons, interactive tests, and downloadable materials.',
    },
    {
      icon: MessageCircle,
      title: 'Join Live Streams',
      desc: 'Ask questions in real-time, practice speaking, and connect with other learners.',
    },
    {
      icon: Award,
      title: 'Track Your Progress',
      desc: 'Take mock tests, get feedback, and see your improvement week by week.',
    },
  ];

  return (
    <section style={{ padding: '6rem 0', background: 'var(--bg)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto 4rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
            How It Works
          </h2>
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>
            Simple, transparent, and effective. No BS.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          }}
        >
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
              {/* Step number */}
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