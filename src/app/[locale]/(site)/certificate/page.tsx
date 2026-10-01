import { getTranslations } from 'next-intl/server'
import { LookupForm } from '@/features/certificates/LookupForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'certificate' })
  return { title: `${t('title')} — Highgate`, description: t('lead') }
}

export default async function CertificateLookupPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'certificate' })

  return (
    <main className="doc-page">
      <div className="doc">
        <h1 className="doc-title">{t('title')}</h1>
        <p className="doc-sub" style={{ marginBottom: '1.5rem' }}>{t('lead')}</p>
        <LookupForm
          locale={locale}
          labels={{
            placeholder: t('placeholder'),
            submit: t('submit'),
            help: t('help'),
            badFormat: t('badFormat')
          }}
        />
      </div>
    </main>
  )
}
