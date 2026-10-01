import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'
import { RATE_LIMITS, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { checkOne } from '@/features/courses/grading'
import { isLessonAccessible } from '@/features/learn/progress'

const bodySchema = z.object({
  assignmentId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.union([z.string().max(2000), z.array(z.string().max(500)).max(20)])
})

// Step-by-step test: one question checked as soon as it is answered. The final
// grade and LessonProgress still come from /api/lessons/submit.
export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (auth.ok === false) return auth.response
  const userId = auth.principal.userId

  const limit = await consumeRateLimit(RATE_LIMITS.lessonCheckUser, userId)
  if (!limit.allowed) return rateLimitResponse(limit)

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  const { assignmentId, questionId, answer } = parsed.data

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { prompt: true, answerKey: true, lesson: { select: { id: true, courseId: true } } }
  })
  if (!assignment?.answerKey) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const enrolled = await prisma.enrollment.findFirst({
    where: { userId, courseId: assignment.lesson.courseId, status: 'ACTIVE' },
    select: { id: true }
  })
  if (!enrolled) return NextResponse.json({ error: 'not_enrolled' }, { status: 403 })
  if (!(await isLessonAccessible(userId, assignment.lesson.id))) {
    return NextResponse.json({ error: 'locked' }, { status: 403 })
  }

  const result = await checkOne(assignment.answerKey as Record<string, unknown>, assignment.prompt, questionId, answer)
  if (!result) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json(result)
}
