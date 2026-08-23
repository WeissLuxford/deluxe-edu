'use client'

import { useTranslations, useLocale } from 'next-intl'

import Link from "next/link"
import { Media } from '@/features/ui/components/Media'

export default function MentorIntro({ base }: { base: string }) {
  const t = useTranslations('home')
  const locale = useLocale()
  return (
    <section id="mentor">
      <Media slot="home.mentor.portrait" locale={locale} sizes="(max-width: 900px) 100vw, 420px" />
      <div>
        <span>{t('mentorBadge')}</span>
        <h2>{t('mentorTitle')}</h2>
        <p>{t('mentorLead')}</p>
        <ul>
          <li>{t('mb1')}</li>
          <li>{t('mb2')}</li>
          <li>{t('mb3')}</li>
          <li>{t('mb4')}</li>
          <li>{t('mb5')}</li>
        </ul>
        <div>
          <Link href={`${base}/courses`}>{t('viewCourses')}</Link>
          <Link href={`${base}/contacts`}>{t('contactMentor')}</Link>
        </div>
      </div>
    </section>
  )
}
