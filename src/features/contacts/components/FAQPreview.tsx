'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';

export function FAQPreview() {
  const faqs = [
    {
      q: 'How much does it cost?',
      a: '$15-20/month depending on the plan. No hidden fees.',
    },
    {
      q: 'Do I need to pay upfront?',
      a: 'Nope! Try our free trial lesson first, then decide.',
    },
    {
      q: 'Can I learn without a teacher?',
      a: 'Yes! Self-study materials are available. Or add a mentor for feedback.',
    },
    {
      q: 'Are live streams recorded?',
      a: 'Yes, all streams are saved so you can watch later.',
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
              Quick Questions
            </h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              Still have questions? Check our full FAQ or just message us.
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
                View Full FAQ <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}