import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { RATE_LIMITS, clientIp, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { checkOne } from '@/features/courses/grading'

const bodySchema = z.object({
  lessonSlug: z.string().min(1).max(100),
  questionId: z.string().min(1).max(100),
  answer: z.union([z.string().max(2000), z.array(z.string().max(500)).max(20)])
})

// Per-question check for the open trial lesson only. The level test is scored
// per section on purpose (no right answers revealed mid-test), so it is not here.
export async function POST(request: NextRequest) {
  const limit = await consumeRateLimit(RATE_LIMITS.freeTestIp, clientIp(request.headers))
  if (!limit.allowed) return rateLimitResponse(limit)

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  const { lessonSlug, questionId, answer } = parsed.data

  const course = await prisma.course.findUnique({ where: { slug: 'trial-lesson' }, select: { id: true } })
  if (!course) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const lesson = await prisma.lesson.findUnique({
    where: { courseId_slug: { courseId: course.id, slug: lessonSlug } },
    select: { Assignment: { select: { prompt: true, answerKey: true }, take: 1 } }
  })
  const assignment = lesson?.Assignment[0]
  if (!assignment?.answerKey) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const result = await checkOne(assignment.answerKey as Record<string, unknown>, assignment.prompt, questionId, answer)
  if (!result) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json(result)
}
