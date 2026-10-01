import Link from 'next/link'
import { BadgeCheck, Ban, HelpCircle } from 'lucide-react'
import { PrintButton } from '@/features/reports/PrintButton'

export type CertificateResult =
  | { state: 'valid' | 'revoked'; serial: string; studentName: string; courseTitle: string; level: string; issuedAt: Date; revokedAt: Date | null }
  | { state: 'missing'; serial: string }

export function CertificateView({
  result,
  locale,
  labels
}: {
  result: CertificateResult
  locale: string
  labels: {
    valid: string
    revoked: string
    notFound: string
    notFoundHint: string
    student: string
    course: string
    level: string
    issued: string
    revokedOn: string
    serial: string
    checkAnother: string
    print: string
  }
}) {
  const dateFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  return (
    <article className="doc">
      <header className="doc-head">
        <span className="doc-brand">Highgate</span>
        <span className="doc-period doc-serial">{result.serial}</span>
      </header>

      {result.state === 'missing' ? (
        <>
          <div className="doc-verdict doc-verdict--missing" style={{ marginTop: '1.5rem' }}>
            <HelpCircle size={20} aria-hidden="true" />
            {labels.notFound}
          </div>
          <p className="doc-sub" style={{ marginTop: '1rem' }}>
            {labels.notFoundHint}
          </p>
        </>
      ) : (
        <>
          <div
            className={`doc-verdict ${
              result.state === 'valid' ? 'doc-verdict--valid' : 'doc-verdict--revoked'
            }`}
            style={{ marginTop: '1.5rem' }}
          >
            {result.state === 'valid' ? (
              <BadgeCheck size={20} aria-hidden="true" />
            ) : (
              <Ban size={20} aria-hidden="true" />
            )}
            {result.state === 'valid' ? labels.valid : labels.revoked}
          </div>

          <section className="doc-section">
            <dl className="doc-pairs">
              <div className="doc-pair">
                <dt>{labels.student}</dt>
                <dd>{result.studentName}</dd>
              </div>
              <div className="doc-pair">
                <dt>{labels.course}</dt>
                <dd>{result.courseTitle}</dd>
              </div>
              <div className="doc-pair">
                <dt>{labels.level}</dt>
                <dd>{result.level}</dd>
              </div>
              <div className="doc-pair">
                <dt>{labels.issued}</dt>
                <dd>{dateFmt.format(result.issuedAt)}</dd>
              </div>
              {result.revokedAt && (
                <div className="doc-pair">
                  <dt>{labels.revokedOn}</dt>
                  <dd>{dateFmt.format(result.revokedAt)}</dd>
                </div>
              )}
              <div className="doc-pair">
                <dt>{labels.serial}</dt>
                <dd className="doc-serial">{result.serial}</dd>
              </div>
            </dl>
          </section>
        </>
      )}

      <footer className="doc-foot">
        <Link href={`/${locale}/certificate`}>{labels.checkAnother}</Link>
      </footer>

      <div className="doc-actions" style={{ marginTop: '1rem' }}>
        <PrintButton label={labels.print} />
      </div>
    </article>
  )
}
