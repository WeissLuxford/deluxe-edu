import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { RATE_LIMITS, clientIp, consumeRateLimit } from '@/lib/rateLimit'
import { Button } from '@/design/components/Button'
import { Reveal } from '@/design/components/Reveal'
import { Container } from '@/design/components/Type'
import { levelCode } from '@/design/levels'
import { normalizeSerial } from '@/features/certificates/serial'
import { CertificateLookup } from '@/features/certificates/CertificateLookup'
import { PrintButton } from '@/features/reports/PrintButton'
import s from '@/features/certificates/certificate.module.css'

// A public trust page: it should be findable, so unlike a parent report it has
// no noindex. A revoked certificate stays visible as revoked — "issued and
// cancelled" and "never existed" are different facts for whoever checks it.
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string; serial: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale, serial } = await params
  const t = await getTranslations({ locale, namespace: 'certificatePage' })
  const normalized = normalizeSerial(decodeURIComponent(serial))
  const title = t('title').replace(/<\/?it>/g, '')
  return { title: normalized ? `${normalized} — ${title}` : `${title} — Highgate`, description: t('lead') }
}

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)
const Cross = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true">
    <path d="M7 7l10 10M17 7L7 17" />
  </svg>
)

export default async function CertificatePage({ params }: Props) {
  const { locale, serial } = await params
  const normalized = normalizeSerial(decodeURIComponent(serial))
  if (!normalized) notFound()

  const limit = await consumeRateLimit(RATE_LIMITS.certVerifyIp, clientIp(await headers()))
  if (!limit.allowed) notFound()

  const t = await getTranslations({ locale, namespace: 'certificatePage' })
  const certificate = await prisma.certificate.findUnique({
    where: { serial: normalized },
    select: {
      serial: true,
      level: true,
      issuedAt: true,
      revokedAt: true,
      user: { select: { firstName: true, lastName: true, name: true } },
      course: { select: { title: true } }
    }
  })

  const date = (d: Date) => new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

  if (!certificate) {
    return (
      <Container className={s.result}>
        <span className={`${s.status} ${s.missing}`}>
          <span className={s.statusIcon}><Cross /></span>
          {t('missing')}
        </span>
        <Reveal className={s.missingCard}>
          <span className={s.missingSerial}>{normalized}</span>
          <p className={s.missingHint}>{t('missingHint')}</p>
          <CertificateLookup />
        </Reveal>
      </Container>
    )
  }

  const revoked = Boolean(certificate.revokedAt)
  const name = [certificate.user.firstName, certificate.user.lastName].filter(Boolean).join(' ') || certificate.user.name || '—'
  const level = levelCode(certificate.level)
  const course = localized(certificate.course.title, locale) || '—'
  const rich = { b: (c: ReactNode) => <b>{c}</b> }

  return (
    <Container className={s.result}>
      <span className={`${s.status} ${revoked ? s.revoked : s.valid}`}>
        <span className={s.statusIcon}>{revoked ? <Cross /> : <Check />}</span>
        {revoked ? t('revokedOn', { date: date(certificate.revokedAt!) }) : t('valid')}
      </span>

      <Reveal className={`${s.frame} ${revoked ? s.frameRevoked : ''}`}>
        <article className={s.sheet}>
          <span className={s.watermark} aria-hidden="true">{level}</span>
          <div className={s.sheetMain}>
            <span className={s.kicker}>{t('kicker')}</span>
            <span className={s.confirms}>{t('confirms')}</span>
            <span className={`it ${s.name}`}>{name}</span>
            <span className={s.completed}>{t.rich('completed', { ...rich, course, level })}</span>
            <div className={s.facts}>
              <span className={s.fact}>
                <span className={s.factLabel}>{t('date')}</span>
                <span className={s.factValue}>{date(certificate.issuedAt)}</span>
              </span>
              <span className={s.fact}>
                <span className={s.factLabel}>{t('number')}</span>
                <span className={`${s.factValue} ${s.serial}`}>{certificate.serial}</span>
              </span>
            </div>
          </div>
          <div className={s.sheetSide}>
            {!revoked && (
              <span className={s.seal}>
                <span className={s.sealCode}>{level}</span>
                <span className={s.sealText}>{t('passed')}</span>
              </span>
            )}
            <span className={s.verifyAt}>
              {t('checkAt')}
              <br />
              highgate.uz/certificate
            </span>
          </div>
        </article>
      </Reveal>

      <div className={s.actions}>
        <PrintButton label={t('print')} />
        <Button href={`/${locale}/results#certificate`} variant="ghost" size="md">
          {t('checkAnother')}
        </Button>
      </div>
    </Container>
  )
}
