import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireTeacher } from '@/features/teacher/requireTeacher'
import { requireOwnedGroup } from '@/features/teacher/ownership'
import {
  generateGroupReports,
  saveReportComment,
  publishReport,
  revokeReport,
  regenerateReport
} from '@/features/teacher/reportActions'
import { TeacherPageHead } from '@/features/teacher/components/TeacherPageHead'
import { ReportGenerateForm } from '@/features/teacher/components/ReportGenerateForm'
import { ReportCard, type ReportCardData } from '@/features/teacher/components/ReportCard'
import { periodLabel } from '@/features/reports/collect'
import type { ReportSnapshot } from '@/features/reports/collect'
import { SITE_URL } from '@/lib/siteUrl'


export default async function GroupReportsPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const teacher = await requireTeacher(locale)

  const group = await requireOwnedGroup(id, teacher.id)
  if (!group) notFound()

  const reports = await prisma.monthlyReport.findMany({
    where: { groupId: id },
    orderBy: [{ periodStart: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      token: true,
      data: true,
      comment: true,
      status: true,
      periodStart: true,
      publishedAt: true,
      revokedAt: true,
      viewCount: true,
      user: { select: { firstName: true, lastName: true, name: true } }
    }
  })

  // Отчёты сгруппированы по месяцу — преподаватель работает месяцем, а не
  // сплошным списком.
  const byPeriod = new Map<string, typeof reports>()
  for (const report of reports) {
    const key = report.periodStart.toISOString()
    const list = byPeriod.get(key) ?? []
    list.push(report)
    byPeriod.set(key, list)
  }

  return (
    <div className="space-y-6">
      <TeacherPageHead
        title="Отчёты родителям"
        subtitle={`Группа «${group.name}»`}
        backHref={`/${locale}/teacher/groups/${id}`}
        backLabel="К группе"
      />

      <section className="admin-card">
        <h3 className="admin-card__title">Собрать отчёты за месяц</h3>
        <p className="hint" style={{ margin: '0.5rem 0 1rem' }}>
          Числа снимаются один раз и дальше не меняются. Уже опубликованные отчёты пересборка не
          трогает.
        </p>
        <ReportGenerateForm action={generateGroupReports.bind(null, id)} />
      </section>

      {reports.length === 0 ? (
        <div className="admin-empty">
          Отчётов пока нет. Выберите месяц выше и соберите первый.
        </div>
      ) : (
        Array.from(byPeriod.entries()).map(([key, list]) => (
          <section key={key} className="space-y-3">
            <h3 className="admin-card__title" style={{ textTransform: 'capitalize' }}>
              {periodLabel(new Date(key))}
            </h3>

            {list.map(report => {
              const data = report.data as unknown as ReportSnapshot

              const card: ReportCardData = {
                id: report.id,
                studentName:
                  [report.user.firstName, report.user.lastName].filter(Boolean).join(' ') ||
                  report.user.name ||
                  'Без имени',
                status: report.status,
                publishedAt: report.publishedAt?.toISOString() ?? null,
                revokedAt: report.revokedAt?.toISOString() ?? null,
                viewCount: report.viewCount,
                comment: report.comment,
                url: `${SITE_URL}/${locale}/r/${report.token}`,
                summary: {
                  homeworkAverage: data.homework.averageGrade,
                  attendanceRate: data.attendance.ratePercent,
                  lessonsPassed: data.lessons.passed,
                  position: data.rank.position,
                  of: data.rank.of,
                  exams: data.exams.length
                }
              }

              return (
                <ReportCard
                  key={report.id}
                  report={card}
                  saveComment={saveReportComment.bind(null, report.id)}
                  publish={publishReport.bind(null, report.id)}
                  revoke={revokeReport.bind(null, report.id)}
                  regenerate={regenerateReport.bind(null, report.id)}
                />
              )
            })}
          </section>
        ))
      )}
    </div>
  )
}
