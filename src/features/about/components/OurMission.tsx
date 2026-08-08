'use client';

import { motion } from 'framer-motion';
import { DollarSign, Users, Heart, Zap } from 'lucide-react';

export function OurMission() {
  return (
    <section id="mission" style={{ padding: '6rem 0', background: 'var(--bg)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto 4rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem' }}>
            Why We Started Deluxe Edu
          </h2>
          <p className="text-muted" style={{ fontSize: '1.2rem', lineHeight: '1.7' }}>
            We were <strong style={{ color: 'var(--fg)' }}>fed up</strong> with seeing people pay{' '}
            <strong style={{ color: '#ef4444' }}>$100-300/month</strong> for mediocre courses from arrogant teachers who
            don't actually teach. Students go into <strong style={{ color: '#ef4444' }}>debt</strong> just to learn English.
            That's insane.
          </p>
          <p className="text-muted" style={{ fontSize: '1.2rem', lineHeight: '1.7', marginTop: '1rem' }}>
            So we built a platform where <strong style={{ color: 'var(--gold)' }}>$15-20/month</strong> gets you everything:
            structured courses, live streams, expert feedback, and a community that actually cares.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div
          style={{
            display: 'grid',
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          }}
        >
          {[
            {
              icon: DollarSign,
              title: 'Affordable for Everyone',
              desc: 'Quality education for $15-20/month, not $300. No more debt. No more gatekeeping.',
              color: '#22c55e',
            },
            {
              icon: Users,
              title: 'No Arrogance, Just Results',
              desc: 'Our teachers have IELTS 8.0 and actually care. No high horses, just human beings helping humans.',
              color: 'var(--gold)',
            },
            {
              icon: Heart,
              title: 'Built for Real People',
              desc: "Whether you're a student, a parent, or working two jobs — you deserve to learn English.",
              color: '#ef4444',
            },
            {
              icon: Zap,
              title: 'Flexible Learning',
              desc: 'Study solo with materials or join live streams. Ask questions. Learn at your own pace.',
              color: '#3b82f6',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel"
              style={{ padding: '2rem', textAlign: 'center' }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: `${item.color}20`,
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <item.icon size={32} color={item.color} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--fg)' }}>
                {item.title}
              </h3>
              <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}