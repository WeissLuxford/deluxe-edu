'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';

export function FAQPreview() {
  const t = useTranslations('contacts');
  const faqs = [
    {
      q: t('q1'),
      a: t('a1'),
    },
    {
      q: t('q2'),
      a: t('a2'),
    },
    {
      q: t('q3'),
      a: t('a3'),
    },
    {
      q: t('q4'),
      a: t('a4'),
    },
  ];

  return (
    <section style={{ padding: '6rem 0', background: 'var(--bg)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <HelpCircle size={48} color="var(--gold)" style={{ margin: '0 auto 1rem' }} />
            <h2 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
              {t('faqTitle')}
            </h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              {t('faqLead')}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  style={{ paddingBottom: i < faqs.length - 1 ? '1.5rem' : 0, borderBottom: i < faqs.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--fg)' }}>
                    {faq.q}
                  </h4>
                  <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link href="/#faq" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {t('faqAll')} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}