'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/features/admin/requireAdmin'
import { newCertificateSerial } from './issue'

export type ActionResult = { ok: boolean; error?: string }

const issueSchema = z.object({
  courseId: z.string().trim().min(1, 'Выберите курс'),
  level: z.string().trim().min(1, 'Укажите уровень').max(60),
  note: z.string().trim().max(300).optional()
})

export async function issueCertificate(
  userId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin()

  const parsed = issueSchema.safeParse({
    courseId: String(form.get('courseId') ?? ''),
    level: String(form.get('level') ?? ''),
    note: String(form.get('note') ?? '').trim() || undefined
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const [student, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.course.findUnique({ where: { id: parsed.data.courseId }, select: { id: true } })
  ])
  if (!student) return { ok: false, error: 'Ученик не найден' }
  if (!course) return { ok: false, error: 'Курс не найден' }

  // Серийник случайный, поэтому теоретическое совпадение возможно — пара
  // попыток дешевле, чем упавшее действие с ошибкой уникальности.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const serial = newCertificateSerial()
    const taken = await prisma.certificate.findUnique({ where: { serial }, select: { id: true } })
    if (taken) continue

    await prisma.certificate.create({
      data: {
        userId,
        courseId: course.id,
        level: parsed.data.level,
        note: parsed.data.note ?? null,
        serial,
        issuedById: admin.id
      }
    })

    revalidatePath(`/ru/admin/students/${userId}`)
    return { ok: true, error: serial }
  }

  return { ok: false, error: 'Не удалось выдать номер, попробуйте ещё раз' }
}

/**
 * Отзыв не удаляет запись: страница проверки должна отличать «выдан и
 * аннулирован» от «не существовал».
 */
export async function revokeCertificate(certificateId: string): Promise<ActionResult> {
  await requireAdmin()

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: { id: true, userId: true, revokedAt: true }
  })
  if (!certificate) return { ok: false, error: 'Сертификат не найден' }

  await prisma.certificate.update({
    where: { id: certificateId },
    data: { revokedAt: certificate.revokedAt ? null : new Date() }
  })

  revalidatePath(`/ru/admin/students/${certificate.userId}`)
  return { ok: true }
}
