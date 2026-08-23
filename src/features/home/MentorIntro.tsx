'use client'

import { useTranslations, useLocale } from 'next-intl'

import { Media } from '@/features/ui/components/Media'
import { ChunkyButton } from '@/features/ui/components/ChunkyButton'

export default function MentorIntro({ base }: { base: string }) {
  const t = useTranslations('home')
  const locale = useLocale()
  return (
    <section id="mentor">
      <div className="container mentor-grid">
        <div className="mentor-media">
          <div className="mentor-glow" />
          <div className="mentor-photo-wrap">
            <Media slot="home.mentor.portrait" locale={locale} sizes="(max-width: 900px) 100vw, 420px" className="mentor-photo" />
          </div>
        </div>

        <div className="mentor-content">
          <span className="badge badge-primary">{t('mentorBadge')}</span>
          <h2 className="section-title">{t('mentorTitle')}</h2>
          <p className="section-sub">{t('mentorLead')}</p>
          <ul className="mentor-list">
            <li>{t('mb1')}</li>
            <li>{t('mb2')}</li>
            <li>{t('mb3')}</li>
            <li>{t('mb4')}</li>
            <li>{t('mb5')}</li>
          </ul>
          <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
            <ChunkyButton href={`${base}/courses`} color="brand">
              {t('viewCourses')}
            </ChunkyButton>
            <ChunkyButton href={`${base}/contacts`} color="neutral">
              {t('contactMentor')}
            </ChunkyButton>
          </div>
        </div>
      </div>
    </section>
  )
}
