'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { DollarSign, Users, Heart, Zap } from 'lucide-react';

export function OurMission() {
  const t = useTranslations('about');
  return (
    <section id="mission" className="vx-band about-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto 4rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem' }}>
            {t('storyTitle')}
          </h2>
          <p className="text-muted" style={{ fontSize: '1.2rem', lineHeight: '1.7' }}>
            {t('story1')}
          </p>
          <p className="text-muted" style={{ fontSize: '1.2rem', lineHeight: '1.7', marginTop: '1rem' }}>
            {t('story2')}
          </p>
        </motion.div>

        <div className="about-grid-4">
          {[
            {
              icon: DollarSign,
              title: t('m1t'),
              desc: t('m1d'),
            },
            {
              icon: Users,
              title: t('m4t'),
              desc: t('m4d'),
            },
            {
              icon: Heart,
              title: t('m3t'),
              desc: t('m3d'),
            },
            {
              icon: Zap,
              title: t('m2t'),
              desc: t('m2d'),
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
              <div className="about-icon">
                <item.icon size={30} strokeWidth={1.6} />
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