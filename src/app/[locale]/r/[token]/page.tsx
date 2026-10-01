import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { isPublicToken, PRIVATE_LINK_METADATA } from '@/lib/publicToken'
import { RATE_LIMITS, clientIp, consumeRateLimit } from '@/lib/rateLimit'
import { ReportView } from '@/features/reports/ReportView'
import { PrintButton } from '@/features/reports/PrintButton'
import type { ReportSnapshot } from '@/features/reports/collect'

// Страница живёт вне (site)/(open)/(learn): у родителя нет аккаунта, и ему не
// нужны ни навигация, ни шапка — нужен документ, который можно распечатать.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Отчёт об учёбе — Highgate',
  ...PRIVATE_LINK_METADATA
}

export default async function ParentReportPage({
  params
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { token } = await params

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

  return (
    <div className="doc-page">
      <ReportView data={data} comment={report.comment} publishedAt={report.publishedAt} />
      <div className="doc-actions">
        <PrintButton label="Распечатать или сохранить в PDF" />
      </div>
    </div>
  )
}
