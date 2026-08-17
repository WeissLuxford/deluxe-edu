'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { Phone, Send, Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

export function ContactMethods() {
  const t = useTranslations('contacts');
  const contacts = [
    {
      icon: Phone,
      title: t('callTitle'),
      value: '+998 90 123 45 67',
      link: 'tel:+998901234567',
      desc: t('callHint'),
      color: 'var(--brand)',
      action: t('callCta'),
    },
    {
      icon: Send,
      title: t('tgCta'),
      value: '@vertexedu',
      link: 'https://t.me/vertexedu',
      desc: t('tgHint'),
      color: '#0088cc',
      action: t('tgTitle'),
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@vertexedu.uz',
      link: 'mailto:hello@vertexedu.uz',
      desc: t('mailHint'),
      color: 'var(--brand)',
      action: t('mailCta'),
    },
  ];

  return (
    <section id="contact-methods" className="vx-band about-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '700px', margin: '0 auto 4rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
            {t('methodsTitle')}
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>
            {t('methodsLead')}
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {contacts.map((contact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel"
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                transition: 'var(--transition)',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.02 }}
              onClick={() => window.open(contact.link, '_blank')}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `color-mix(in oklab, ${contact.color} 14%, transparent)`,
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <contact.icon size={36} color={contact.color} />
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--fg)' }}>
                {contact.title}
              </h3>

              <p
                style={{
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  color: contact.color,
                  marginBottom: '0.5rem',
                }}
              >
                {contact.value}
              </p>

              <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {contact.desc}
              </p>

             <a
                href={contact.link}
                className="btn-secondary"
                style={{
                  width: '100%',
                  borderColor: contact.color,
                  color: contact.color,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {contact.action}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="glass-panel"
          style={{ marginTop: '3rem', padding: '2rem', maxWidth: '700px', margin: '3rem auto 0' }}
        >
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
            <div>
              <Clock size={24} color="var(--gold)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--fg)', fontWeight: '600', marginBottom: '0.25rem' }}>
                {t('hours')}
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Mon-Sun: 9 AM - 9 PM
              </p>
            </div>

            <div>
              <MapPin size={24} color="var(--gold)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--fg)', fontWeight: '600', marginBottom: '0.25rem' }}>
                {t('location')}
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                {t('locationValue')}
              </p>
            </div>

            <div>
              <MessageCircle size={24} color="var(--gold)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--fg)', fontWeight: '600', marginBottom: '0.25rem' }}>
                {t('responseTime')}
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                {t('responseValue')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}