'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function CTASection({ base }: { base: string }) {
  const t = useTranslations('home')

  return (
    <section>
      <div>
        <h2>{t('ctaTitle')}</h2>
        <p>{t('ctaLead')}</p>
        <div>
          <Link href={`${base}/trial-lesson`}>{t('ctaStart')}</Link>
          <Link href={`${base}/courses`}>{t('ctaBrowse')}</Link>
        </div>
      </div>
    </section>
  )
}
