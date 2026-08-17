'use client'

import { useTranslations, useLocale } from 'next-intl'

import Link from "next/link"
import { Media } from '@/features/ui/components/Media'

export default function MentorIntro({ base }: { base: string }) {
  const t = useTranslations('home')
  const locale = useLocale()
  return (
    <section id="mentor" className="relative py-24" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="mentor-grid glass-panel">
          <div className="mentor-media">
            <div className="mentor-photo-wrap">
              <Media slot="home.mentor.portrait" locale={locale} className="mentor-photo" sizes="(max-width: 900px) 100vw, 420px" />
              <div className="mentor-glow" />
            </div>
          </div>
          <div className="mentor-content">
            <div style={{ marginBottom: '1rem' }}>
              <span className="badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>{t('mentorBadge')}</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 text-gradient">{t('mentorTitle')}</h2>
            <p className="text-lg text-muted mb-6">
              {t('mentorLead')}
            </p>
            <ul className="mentor-list">
              <li>{t('mb1')}</li>
              <li>{t('mb2')}</li>
              <li>{t('mb3')}</li>
              <li>{t('mb4')}</li>
              <li>{t('mb5')}</li>
            </ul>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link href={`${base}/courses`} className="iridescent vx">{t('viewCourses')}</Link>
              <Link href={`${base}/contacts`} className="btn-secondary">{t('contactMentor')}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}