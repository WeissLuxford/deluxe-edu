'use client';

import { useTranslations } from 'next-intl';

import { MessageCircle } from 'lucide-react';
import LeadForm from '@/features/leads/LeadForm';

export function ContactFormBlock() {
  const t = useTranslations('contacts');
  return (
    <section>
      <MessageCircle size={48} />
      <h2>{t('formTitle')}</h2>
      <p>{t('formLead')}</p>

      <LeadForm source="CONTACTS_PAGE" />
    </section>
  );
}
