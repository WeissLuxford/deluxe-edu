'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Award, Heart } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'

export function OurTeam() {
  const t = useTranslations('about')
  const tTeachers = useTranslations('teachers')
  const base = `/${useLocale()}`

  return (
    <Section
      id="team"
      tone="raised"
      texture="wash"
      accent="var(--accent-amber)"
      title={t('teamTitle')}
      subtitle={t('teamLead')}
    >
      <div className="team-grid">
        <Reveal as="article" className="team-card">
          <span className="team-card__mark" aria-hidden="true">Co</span>
          <h3 className="team-card__name">{t('roleFounder')}</h3>
          <p className="team-card__role">{t('roleVisionary')}</p>
          <p className="team-card__bio">{t('bioFounder')}</p>
        </Reveal>

        <Reveal as="article" className="team-card" delay={0.08}>
          <span className="team-card__mark" aria-hidden="true">T</span>
          <h3 className="team-card__name">{t('roleTeacher')}</h3>
          <p className="team-card__role">{t('tCertified')}</p>
          <ul className="team-card__creds">
            <li>IELTS 8.0</li>
          </ul>
          <p className="team-card__bio">{t('bioTeacher')}</p>

          <div className="team-card__traits">
            <span>
              <Award size={16} aria-hidden="true" /> {t('tExpert')}
            </span>
            <span>
              <Heart size={16} aria-hidden="true" /> {t('tCaring')}
            </span>
          </div>
        </Reveal>
      </div>

      <p className="team-note">{t('teamNote')}</p>

      <div className="page-actions">
        <ArrowLinkButton href={`${base}/teachers`}>{tTeachers('title')}</ArrowLinkButton>
      </div>
    </Section>
  )
}
