import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { BadgeCheck } from 'lucide-react'
import { realReviews, issuedCertificateCount } from '@/features/results/registry'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'results' })
  return { title: `${t('title')} — Highgate`, description: t('lead') }
}

export default async function ResultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'results' })

  const [reviews, certificates] = await Promise.all([
    Promise.resolve(realReviews()),
    issuedCertificateCount()
  ])

  return (
    <main className="doc-page">
      <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
        <h1 className="doc-title">{t('title')}</h1>
        <p className="doc-sub" style={{ marginBottom: '2rem' }}>{t('lead')}</p>

        {/* Счётчик показывается только когда есть что считать: «0 сертификатов»
            это не скромность, это антиреклама. */}
        {certificates > 0 && (
          <div className="doc-stats" style={{ marginBottom: '2rem' }}>
            <div className="doc-stat">
              <div className="doc-stat__value">{certificates}</div>
              <div className="doc-stat__label">{t('certificatesIssued')}</div>
              <div className="doc-stat__hint">
                <Link href={`/${locale}/certificate`}>{t('verify')}</Link>
              </div>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="doc-empty">{t('empty')}</p>
        ) : (
          <section className="doc-section">
            <h2 className="doc-section__title">{t('reviewsTitle')}</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {reviews.map(review => (
                <article key={review.name + review.text.slice(0, 20)} className="doc-comment">
                  <p style={{ margin: 0 }}>{review.text}</p>
                  <p className="doc-comment__author">
                    — {review.name}
                    {review.result ? ` · ${review.result}` : ''}
                  </p>
                  {review.certificateSerial && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem' }}>
                      <BadgeCheck size={14} aria-hidden="true" />{' '}
                      <Link
                        href={`/${locale}/certificate/${review.certificateSerial}`}
                        className="doc-serial"
                      >
                        {review.certificateSerial}
                      </Link>
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
