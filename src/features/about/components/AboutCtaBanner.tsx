'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HeaderLeadModal } from '@/features/ui/components/HeaderLeadModal';

export function AboutCtaBanner() {
  const t = useTranslations('about');
  const [open, setOpen] = useState(false);

  return (
    <section>
      <h2>{t('midCtaTitle')}</h2>
      <p>{t('midCtaLead')}</p>
      <button type="button" onClick={() => setOpen(true)}>{t('midCtaButton')}</button>

      {open && <HeaderLeadModal onClose={() => setOpen(false)} />}
    </section>
  );
}
