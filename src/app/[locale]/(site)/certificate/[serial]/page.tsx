import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { RATE_LIMITS, clientIp, consumeRateLimit } from '@/lib/rateLimit'
import { normalizeSerial } from '@/features/certificates/serial'
import { CertificateView, type CertificateResult } from '@/features/certificates/CertificateView'

// Проверка сертификата — открытая страница доверия: её должно быть видно в
// поиске, поэтому никакого noindex здесь нет, в отличие от отчёта родителю.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; serial: string }> }) {
  const { locale, serial } = await params
  const t = await getTranslations({ locale, namespace: 'certificate' })
  const normalized = normalizeSerial(decodeURIComponent(serial))
  return {
    title: normalized ? `${normalized} — ${t('title')}` : `${t('title')} — Highgate`,
    description: t('lead')
  }
}

export default async function CertificateResultPage({
  params
}: {
  params: Promise<{ locale: string; serial: string }>
}) {
  const { locale, serial } = await params
  const t = await getTranslations({ locale, namespace: 'certificate' })

  const normalized = normalizeSerial(decodeURIComponent(serial))
  // Мусор в адресе — это не «сертификат не найден», это неверный адрес.
  if (!normalized) notFound()

  const ip = clientIp(await headers())
  const limit = await consumeRateLimit(RATE_LIMITS.certVerifyIp, ip)
  if (!limit.allowed) notFound()

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

  const labels = {
    valid: t('valid'),
    revoked: t('revoked'),
    notFound: t('notFound'),
    notFoundHint: t('notFoundHint'),
    student: t('student'),
    course: t('course'),
    level: t('level'),
    issued: t('issued'),
    revokedOn: t('revokedOn'),
    serial: t('serial'),
    checkAnother: t('checkAnother'),
    print: t('print')
  }

  // «Выдан и аннулирован» и «не существовал» — разная информация для того, кто
  // проверяет документ, поэтому отозванный сертификат остаётся видимым.
  const result: CertificateResult = certificate
    ? {
        state: certificate.revokedAt ? 'revoked' : 'valid',
        serial: certificate.serial,
        studentName:
          [certificate.user.firstName, certificate.user.lastName].filter(Boolean).join(' ') ||
          certificate.user.name ||
          '—',
        courseTitle: localized(certificate.course.title, locale) || '—',
        level: certificate.level,
        issuedAt: certificate.issuedAt,
        revokedAt: certificate.revokedAt
      }
    : { state: 'missing', serial: normalized }

  return (
    <main className="doc-page">
      <CertificateView result={result} locale={locale} labels={labels} />
    </main>
  )
}
