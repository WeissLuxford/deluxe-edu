'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { HeaderLeadModal } from '@/features/ui/components/HeaderLeadModal';

export function AboutCtaBanner() {
  const t = useTranslations('about');
  const [open, setOpen] = useState(false);

  return (
    <section className="vx-band about-section" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="cta-glass"
          style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}
        >
          <h2 className="hero-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', marginBottom: '1rem' }}>
            {t('midCtaTitle')}
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
            {t('midCtaLead')}
          </p>
          <button type="button" onClick={() => setOpen(true)} className="iridescent vx">
            {t('midCtaButton')}
          </button>
        </motion.div>
      </div>

      {open && <HeaderLeadModal onClose={() => setOpen(false)} />}
    </section>
  );
}
