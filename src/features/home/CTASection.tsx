'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'
import { Reveal } from '@/features/ui/components/Reveal'

export default function CTASection({ base }: { base: string }) {
  const t = useTranslations('home')

  return (
    <section id="cta">
      <div className="container">
        <Reveal className="cta-panel">
          <span className="cta-panel__glow cta-panel__glow--a" aria-hidden="true" />
          <span className="cta-panel__glow cta-panel__glow--b" aria-hidden="true" />

          <span className="badge badge-primary cta-panel__tag">{t('ctaTag')}</span>

          <h2 className="cta-panel__title">
            {t('ctaTitleLead')} <em>{t('ctaTitleEmphasis')}</em>
          </h2>

          <p className="cta-panel__lead">{t('ctaLead')}</p>

          <div className="cta-panel__actions">
            <ArrowLinkButton href={`${base}/trial-lesson`} tone="invert">
              {t('ctaStart')}
            </ArrowLinkButton>
            <Link href={`${base}/courses`} className="cta-panel__browse">
              {t('ctaBrowse')}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
