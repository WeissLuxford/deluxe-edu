'use client';

import { motion } from 'framer-motion';
import { Phone, Send, Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

export function ContactMethods() {
  const contacts = [
    {
      icon: Phone,
      title: 'Call or WhatsApp',
      value: '+998 90 123 45 67',
      link: 'tel:+998901234567',
      desc: 'Available 9 AM - 9 PM (GMT+5)',
      color: '#22c55e',
      action: 'Call Now',
    },
    {
      icon: Send,
      title: 'Telegram',
      value: '@deluxeedu',
      link: 'https://t.me/deluxeedu',
      desc: 'Fastest response time',
      color: '#0088cc',
      action: 'Message on Telegram',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@deluxeedu.uz',
      link: 'mailto:hello@deluxeedu.uz',
      desc: 'We reply within 24 hours',
      color: '#ef4444',
      action: 'Send Email',
    },
  ];

  return (
    <section id="contact-methods" style={{ padding: '6rem 0', background: 'var(--bg)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '700px', margin: '0 auto 4rem', textAlign: 'center' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
            How to Reach Us
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>
            Pick your favorite way to connect. We're real humans, not an automated system.
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
                  background: `${contact.color}20`,
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

        {/* Additional Info */}
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
                Working Hours
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Mon-Sun: 9 AM - 9 PM
              </p>
            </div>

            <div>
              <MapPin size={24} color="var(--gold)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--fg)', fontWeight: '600', marginBottom: '0.25rem' }}>
                Location
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Tashkent, Uzbekistan
              </p>
            </div>

            <div>
              <MessageCircle size={24} color="var(--gold)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--fg)', fontWeight: '600', marginBottom: '0.25rem' }}>
                Response Time
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Usually within 2-3 hours
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}