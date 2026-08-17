'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MediaDecor } from '@/features/ui/components/MediaDecor'

export default function CTASection({ base }: { base: string }) {
  const t = useTranslations('home')

  return (
    <section className="relative py-28 flex items-center justify-center vx-band vx-band--accent">
      <div className="absolute inset-0 hero-gradient opacity-40" />
      <MediaDecor slot="home.cta.side" side="left" size="md" />
      <div className="container relative">
        <div className="cta-glass mx-auto max-w-3xl text-center p-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gradient">
            {t('ctaTitle')}
          </h2>
          <p className="text-lg text-muted mb-10">
            {t('ctaLead')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`${base}/trial-lesson`} className="iridescent vx">
              {t('ctaStart')}
            </Link>
            <Link href={`${base}/courses`} className="btn-secondary">
              {t('ctaBrowse')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
