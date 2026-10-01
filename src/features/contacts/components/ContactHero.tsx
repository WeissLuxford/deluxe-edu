'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Section } from '@/features/ui/components/Section'
import { Button } from '@/features/ui/components/Button'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'

export function ContactHero() {
  const t = useTranslations('contacts')
  const base = `/${useLocale()}`

  return (
    <Section
      tone="raised"
      texture="wash"
      accent="var(--accent-blue)"
      title={t('heroTitle')}
      subtitle={t('heroLead')}
      width="narrow"
    >
      <div className="page-actions">
        <Button href={`${base}/contacts#contact-methods`} color="brand">
          {t('ctaContact')}
        </Button>
        {/* Раньше вело на /trial-lesson без локали — то есть мимо всех
            локализованных маршрутов. */}
        <ArrowLinkButton href={`${base}/trial-lesson`}>{t('ctaTrial')}</ArrowLinkButton>
      </div>
    </Section>
  )
}
