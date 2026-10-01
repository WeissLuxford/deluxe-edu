'use client'

import { useTranslations } from 'next-intl'
import { Section } from '@/features/ui/components/Section'
import LeadForm from '@/features/leads/LeadForm'

export function ContactFormBlock() {
  const t = useTranslations('contacts')

  return (
    <Section
      id="contact-form"
      tone="raised"
      texture="wash"
      accent="var(--accent-violet)"
      title={t('formTitle')}
      subtitle={t('formLead')}
      width="narrow"
    >
      <div className="contact-form-card">
        <LeadForm source="CONTACTS_PAGE" />
      </div>
    </Section>
  )
}
