'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Reveal } from '@/features/ui/components/Reveal'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'

export function JoinMovement() {
  const t = useTranslations('about')
  const base = `/${useLocale()}`

  return (
    <section>
      <div className="container">
        <Reveal className="cta-panel">
          <span className="cta-panel__glow cta-panel__glow--a" aria-hidden="true" />
          <span className="cta-panel__glow cta-panel__glow--b" aria-hidden="true" />

          <h2 className="cta-panel__title">{t('joinTitle')}</h2>
          <p className="cta-panel__lead">{t('joinLead')}</p>

          <div className="cta-panel__actions">
            <ArrowLinkButton href={`${base}/courses`} tone="invert">
              {t('joinCourses')}
            </ArrowLinkButton>
            <Link href={`${base}/trial-lesson`} className="cta-panel__browse">
              {t('joinTrial')}
            </Link>
          </div>

          <p className="cta-panel__note">{t('joinNote')}</p>
        </Reveal>
      </div>
    </section>
  )
}
