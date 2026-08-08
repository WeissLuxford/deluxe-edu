'use client';

import { motion } from 'framer-motion';
import { Award, Heart } from 'lucide-react';

export function OurTeam() {
  return (
    <section id="team" style={{ padding: '6rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto 4rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
            Meet the Team
          </h2>
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>
            Two people who got tired of the BS and decided to fix it.
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
          {/* Founder 1 */}
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
              Co-Founder
            </h3>
            <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
              The Visionary
            </p>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              Saw the broken system and said "enough is enough." Built this platform to make education accessible.
            </p>
          </motion.div>

          {/* Teacher */}
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
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                margin: '0 auto 1.5rem',
                display: 'grid',
                placeItems: 'center',
                fontSize: '3rem',
                fontWeight: '800',
                color: '#fff',
              }}
            >
              T
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--fg)' }}>
              Lead Teacher
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="badge-success">IELTS 8.0</span>
              <span className="badge-primary">Certified</span>
            </div>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              An actual good human being who teaches with passion. No arrogance, just results.
            </p>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Award size={24} color="var(--gold)" style={{ marginBottom: '0.25rem' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Expert</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Heart size={24} color="#ef4444" style={{ marginBottom: '0.25rem' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Caring</p>
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
            That's it. No massive team with fancy titles. Just two people who care and a teacher who actually teaches.
          </p>
        </motion.div>
      </div>
    </section>
  );
}