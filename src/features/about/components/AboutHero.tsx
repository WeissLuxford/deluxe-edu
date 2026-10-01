'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Section } from '@/features/ui/components/Section'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'
import { Button } from '@/features/ui/components/Button'

export function AboutHero() {
  const t = useTranslations('about')
  const base = `/${useLocale()}`

  return (
    <Section
      tone="raised"
      texture="wash"
      accent="var(--accent-violet)"
      eyebrow={t('founded')}
      title={t('heroTitle')}
      subtitle={t('heroLead')}
      width="narrow"
    >
      <div className="page-actions">
        <Button href={`${base}/about#mission`} color="brand">
          {t('ctaMission')}
        </Button>
        <ArrowLinkButton href={`${base}/teachers`}>{t('ctaTeam')}</ArrowLinkButton>
      </div>
    </Section>
  )
}
