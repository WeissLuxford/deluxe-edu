'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { newPublicToken } from '@/lib/publicToken'
import { collectMonthly, monthRange } from '@/features/reports/collect'
import { requireTeacher } from './requireTeacher'
import { requireOwnedGroup } from './ownership'
import type { ActionResult } from './types'

const periodSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  // 0-11, как в Date.
  month: z.number().int().min(0).max(11)
})

function refresh(groupId: string) {
  revalidatePath(`/ru/teacher/groups/${groupId}/reports`)
}

/** Отчёт вместе с проверкой, что группа принадлежит этому преподавателю. */
async function ownedReport(reportId: string, teacherId: string) {
  const report = await prisma.monthlyReport.findUnique({
    where: { id: reportId },
    include: { group: { select: { id: true, teacherId: true } } }
  })
  if (!report || report.group.teacherId !== teacherId) return null
  return report
}

export async function generateGroupReports(
  groupId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const group = await requireOwnedGroup(groupId, teacher.id)
  if (!group) return { ok: false, error: 'Группа не найдена' }

  const parsed = periodSchema.safeParse({
    year: Number(form.get('year')),
    month: Number(form.get('month'))
  })
  if (!parsed.success) return { ok: false, error: 'Некорректный период' }

  const { start, end } = monthRange(parsed.data.year, parsed.data.month)

  const members = await prisma.groupMembership.findMany({
    where: { groupId, leftAt: null },
    select: { userId: true }
  })
  if (members.length === 0) return { ok: false, error: 'В группе нет учеников' }

  let created = 0
  let updated = 0
  let skipped = 0

  for (const member of members) {
    const data = await collectMonthly(member.userId, groupId, start, end)
    // Пришёл после конца месяца или ушёл до его начала — отчёта быть не может.
    if (!data) {
      skipped += 1
      continue
    }

    const existing = await prisma.monthlyReport.findUnique({
      where: {
        userId_groupId_periodStart: { userId: member.userId, groupId, periodStart: start }
      },
      select: { id: true, status: true }
    })

    if (!existing) {
      await prisma.monthlyReport.create({
        data: {
          userId: member.userId,
          groupId,
          periodStart: start,
          periodEnd: end,
          data,
          token: newPublicToken(),
          createdById: teacher.id
        }
      })
      created += 1
      continue
    }

    // Опубликованный отчёт не трогаем: родитель его уже видел, а комментарий
    // написан к тем числам, что были в снимке.
    if (existing.status === 'PUBLISHED') {
      skipped += 1
      continue
    }

    await prisma.monthlyReport.update({ where: { id: existing.id }, data: { data } })
    updated += 1
  }

  refresh(groupId)

  const parts = []
  if (created) parts.push(`создано ${created}`)
  if (updated) parts.push(`пересобрано ${updated}`)
  if (skipped) parts.push(`пропущено ${skipped}`)
  return { ok: true, error: parts.join(', ') || undefined }
}

export async function saveReportComment(
  reportId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const report = await ownedReport(reportId, teacher.id)
  if (!report) return { ok: false, error: 'Отчёт не найден' }

  const comment = String(form.get('comment') ?? '').trim().slice(0, 4000)

  await prisma.monthlyReport.update({
    where: { id: reportId },
    data: { comment: comment || null }
  })

  refresh(report.groupId)
  return { ok: true }
}

export async function publishReport(reportId: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const report = await ownedReport(reportId, teacher.id)
  if (!report) return { ok: false, error: 'Отчёт не найден' }

  await prisma.monthlyReport.update({
    where: { id: reportId },
    data: { status: 'PUBLISHED', publishedAt: new Date(), revokedAt: null }
  })

  refresh(report.groupId)
  return { ok: true }
}

/**
 * Отзыв не удаляет отчёт: ссылка перестаёт открываться, но преподаватель видит,
 * что отчёт был и когда его закрыли. Повторная публикация снимает отзыв.
 */
export async function revokeReport(reportId: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const report = await ownedReport(reportId, teacher.id)
  if (!report) return { ok: false, error: 'Отчёт не найден' }

  await prisma.monthlyReport.update({
    where: { id: reportId },
    data: { revokedAt: new Date() }
  })

  refresh(report.groupId)
  return { ok: true }
}

export async function regenerateReport(reportId: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const report = await ownedReport(reportId, teacher.id)
  if (!report) return { ok: false, error: 'Отчёт не найден' }
  if (report.status === 'PUBLISHED') {
    return { ok: false, error: 'Опубликованный отчёт не пересобирается' }
  }

  const data = await collectMonthly(report.userId, report.groupId, report.periodStart, report.periodEnd)
  if (!data) return { ok: false, error: 'Нет данных за период' }

  await prisma.monthlyReport.update({ where: { id: reportId }, data: { data } })

  refresh(report.groupId)
  return { ok: true }
}
