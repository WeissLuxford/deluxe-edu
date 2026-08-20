'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import LeadForm from '@/features/leads/LeadForm';

export function ContactFormBlock() {
  const t = useTranslations('contacts');
  return (
    <section className="vx-band vx-band--raised about-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <MessageCircle size={48} color="var(--gold)" style={{ margin: '0 auto 1rem' }} />
            <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
              {t('formTitle')}
            </h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              {t('formLead')}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
            <LeadForm source="CONTACTS_PAGE" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
