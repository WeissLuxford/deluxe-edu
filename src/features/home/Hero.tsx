'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export default function Hero() {
  const t = useTranslations('home')
  const locale = useLocale()
  const base = `/${locale}`

  return (
    <section>
      <p>{t('introducing')}</p>

      <h2>HIGHGATE</h2>

      <p>{t('tagline')}</p>

      <div>
        <Link href={`${base}/trial-lesson`}>{t('heroPrimary')}</Link>
        <Link href={`${base}/courses`}>{t('heroSecondary')}</Link>
      </div>
    </section>
  )
}
