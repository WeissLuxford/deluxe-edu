'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Video, Calendar, HelpCircle } from 'lucide-react';

export function QuickLinks() {
  const links = [
    {
      icon: BookOpen,
      title: 'Browse Courses',
      desc: 'Explore all available courses',
      href: '/courses',
      color: 'var(--gold)',
    },
    {
      icon: Video,
      title: 'Watch Streams',
      desc: 'Join live English lessons',
      href: '/streams',
      color: '#ef4444',
    },
    {
      icon: Calendar,
      title: 'Try Free Lesson',
      desc: 'No credit card required',
      href: '/trial-lesson',
      color: '#22c55e',
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      desc: 'Common questions answered',
      href: '/#faq',
      color: '#3b82f6',
    },
  ];

  return (
    <section style={{ padding: '6rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '700px', margin: '0 auto 3rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
            Quick Links
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>
            Or maybe you just want to explore on your own?
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {links.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={link.href}
                className="glass-panel"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%',
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `${link.color}20`,
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <link.icon size={32} color={link.color} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--fg)' }}>
                  {link.title}
                </h3>

                <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                  {link.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}