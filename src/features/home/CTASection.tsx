'use client'

import { useTranslations } from 'next-intl'
import { Section } from '@/features/ui/components/Section'
import { ChunkyButton } from '@/features/ui/components/ChunkyButton'

export default function CTASection({ base }: { base: string }) {
  const t = useTranslations('home')

  return (
    <Section id="cta" tone="accent" title={t('ctaTitle')} subtitle={t('ctaLead')}>
      <div className="hero-actions">
        <ChunkyButton href={`${base}/trial-lesson`} color="brand" size="lg">
          {t('ctaStart')}
        </ChunkyButton>
        <ChunkyButton href={`${base}/courses`} color="neutral" size="lg">
          {t('ctaBrowse')}
        </ChunkyButton>
      </div>
    </Section>
  )
}
