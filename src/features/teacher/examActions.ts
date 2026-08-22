'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireTeacher } from './requireTeacher'
import { requireOwnedStudentAttempt } from './ownership'
import type { ActionResult } from './types'

const reviewSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  note: z.string().trim().max(1000).nullable()
})

function readReview(form: FormData) {
  const note = String(form.get('note') ?? '').trim()
  return {
    decision: String(form.get('decision') ?? ''),
    note: note || null
  }
}

export async function reviewExamAttempt(
  attemptId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const attempt = await requireOwnedStudentAttempt(attemptId, teacher.id)
  if (!attempt) return { ok: false, error: 'Попытка не найдена' }

  const parsed = reviewSchema.safeParse(readReview(form))
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      reviewStatus: parsed.data.decision,
      reviewedById: teacher.id,
      reviewedAt: new Date(),
      reviewNote: parsed.data.note
    }
  })

  revalidatePath('/ru/teacher/exams')
  revalidatePath(`/ru/teacher/exams/${attemptId}`)
  return { ok: true }
}
