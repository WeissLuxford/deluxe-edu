'use client'

import { useTranslations, useLocale } from 'next-intl'

import { Media } from '@/features/ui/components/Media'
import { Button } from '@/features/ui/components/Button'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'
import { Reveal } from '@/features/ui/components/Reveal'
import { Section } from '@/features/ui/components/Section'

export default function MentorIntro({ base }: { base: string }) {
  const t = useTranslations('home')
  const locale = useLocale()
  return (
    <Section
      id="mentor"
      tone="raised"
      texture="wash"
      accent="var(--accent-violet)"
      eyebrow={t('mentorBadge')}
      title={t('mentorTitle')}
      subtitle={t('mentorLead')}
    >
      <div className="mentor-grid">
        <Reveal className="mentor-media" x={-24} y={0}>
          <div className="mentor-photo-wrap">
            <Media slot="home.mentor.portrait" locale={locale} sizes="(max-width: 900px) 100vw, 420px" className="mentor-photo" />
          </div>
        </Reveal>

        <Reveal className="mentor-content" x={24} y={0} delay={0.1}>
          <ul className="mentor-list">
            <li>{t('mb1')}</li>
            <li>{t('mb2')}</li>
            <li>{t('mb3')}</li>
            <li>{t('mb4')}</li>
            <li>{t('mb5')}</li>
          </ul>
          <div className="mentor-actions">
            <Button href={`${base}/courses`} color="brand">
              {t('viewCourses')}
            </Button>
            <ArrowLinkButton href={`${base}/teachers`}>{t('meetTeachers')}</ArrowLinkButton>
            <ArrowLinkButton href={`${base}/contacts`}>{t('contactMentor')}</ArrowLinkButton>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
