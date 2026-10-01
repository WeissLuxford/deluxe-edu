import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { isPublicToken, PRIVATE_LINK_METADATA } from '@/lib/publicToken'
import { RATE_LIMITS, clientIp, consumeRateLimit } from '@/lib/rateLimit'
import { ReportView } from '@/features/reports/ReportView'
import { PrintButton } from '@/features/reports/PrintButton'
import type { ReportSnapshot } from '@/features/reports/collect'
import { ThemeSync } from '@/design/layout/ThemeSync'
import s from '@/features/reports/report.module.css'

// Страница живёт вне (site)/(open)/(learn): у родителя нет аккаунта, и ему не
// нужны ни навигация, ни шапка — нужен документ, который можно распечатать.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'reportPage' })
  return { title: t('meta'), ...PRIVATE_LINK_METADATA }
}

export default async function ParentReportPage({
  params
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { locale, token } = await params

  // Проверка формы до базы: перебор мусора не стоит нам запроса.
  if (!isPublicToken(token)) notFound()

  const ip = clientIp(await headers())
  const limit = await consumeRateLimit(RATE_LIMITS.publicReportIp, ip)
  if (!limit.allowed) notFound()

  const report = await prisma.monthlyReport.findUnique({
    where: { token },
    select: {
      id: true,
      data: true,
      comment: true,
      status: true,
      publishedAt: true,
      revokedAt: true
    }
  })

  // Неверный, отозванный и ещё не опубликованный токен отдают одну и ту же 404:
  // иначе перебор различает ответы и узнаёт, что отчёт существует.
  if (!report || report.status !== 'PUBLISHED' || report.revokedAt) notFound()

  // Счётчик просмотров не должен ронять страницу, если запись не удалась.
  void prisma.monthlyReport
    .update({
      where: { id: report.id },
      data: { viewCount: { increment: 1 }, lastViewedAt: new Date() }
    })
    .catch(() => undefined)

  const data = report.data as unknown as ReportSnapshot
  const t = await getTranslations({ locale, namespace: 'reportPage' })

  return (
    <main className={s.page}>
      <ThemeSync area="site" />
      <ReportView
        data={data}
        comment={report.comment}
        publishedAt={report.publishedAt}
        locale={locale}
        token={token}
        actions={<PrintButton label={t('print')} />}
      />
    </main>
  )
}
