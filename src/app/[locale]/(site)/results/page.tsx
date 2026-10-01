import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/design/components/Reveal'
import { Container, Heading } from '@/design/components/Type'
import { CertificateLookup } from '@/features/certificates/CertificateLookup'
import { issuedCertificateCount, realReviews } from '@/features/results/registry'
import s from '@/features/site/info.module.css'
import cs from '@/features/certificates/certificate.module.css'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'resultsPage.meta' })
  return { title: t('title'), description: t('description') }
}

// Story cards rotate through these looks so the wall feels like a pinboard.
const LOOKS: CSSProperties[] = [
  { background: 'var(--c-violet)', color: 'var(--c-white)' },
  { background: 'var(--c-lime)', color: 'var(--c-ink)' },
  { background: 'var(--c-white)', color: 'var(--c-ink)' },
  { background: 'var(--lv-b2-bg)', color: '#5a2508' },
  { background: 'var(--c-white)', color: 'var(--c-ink)' },
  { background: 'var(--lv-a2-bg)', color: 'var(--lv-a2-fg)' }
]

export default async function ResultsPage({ params }: Props) {
  const { locale } = await params
  const [t, tc] = await Promise.all([getTranslations({ locale, namespace: 'resultsPage' }), getTranslations({ locale, namespace: 'certificatePage' })])
  const [reviews, certificates] = await Promise.all([Promise.resolve(realReviews()), issuedCertificateCount()])
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  return (
    <Container>
      <div className={s.headSplit}>
        <Reveal>
          <Heading size="h1">{t.rich('title', rich)}</Heading>
        </Reveal>
        <Reveal delay={80}>
          <p className={s.lead}>{t('lead')}</p>
        </Reveal>
      </div>

      {reviews.length === 0 ? (
        <Reveal className={s.empty}>
          <div>
            <span className={s.emptyTitle}>{t.rich('emptyTitle', rich)}</span>
            <p className={s.emptyText}>{t('emptyText')}</p>
          </div>
        </Reveal>
      ) : (
        <div className={s.wall}>
          {reviews.map((review, i) => (
            <Reveal key={review.name + i} delay={(i % 4) * 70} className={`${s.story} ${i % 5 === 0 || review.text.length > 160 ? s.storyWide : ''}`} style={LOOKS[i % LOOKS.length]}>
              {review.result && <span className={s.storyResult}>{review.result}</span>}
              <span className={s.storyText}>«{review.text}»</span>
              <span className={s.storyWho}>
                {review.name}
                {review.certificateSerial && (
                  <>
                    {' · '}
                    <Link href={`/${locale}/certificate/${review.certificateSerial}`} className={s.storySerial}>
                      {t('verified')}
                    </Link>
                  </>
                )}
              </span>
            </Reveal>
          ))}
          {certificates > 0 && (
            <Reveal className={`${s.story} ${s.counter}`}>
              <span className={s.counterNum}>{certificates}</span>
              <span className={s.storyWho}>
                {t('certificates')}
                <br />
                {t('certificatesHint')}
              </span>
            </Reveal>
          )}
        </div>
      )}

      <Reveal className={cs.check}>
        <div className={cs.checkText} id="certificate">
          <Heading size="h3" as="h2">{tc.rich('title', rich)}</Heading>
          <p className={cs.checkLead}>{tc('lead')}</p>
        </div>
        <CertificateLookup />
      </Reveal>
    </Container>
  )
}
