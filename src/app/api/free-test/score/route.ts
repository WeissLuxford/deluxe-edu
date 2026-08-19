import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { gradeAnswers } from '@/features/courses/grading'
import { RATE_LIMITS, clientIp, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

// Открытые тесты — определение уровня и пробный mock test. Регистрация для них
// не нужна, поэтому роут без сессии; чтобы им нельзя было перебирать ключ,
// проверка идёт по одному разделу за раз и ограничена по IP.
const OPEN_COURSES = ['level-test', 'free-mock-test-online', 'trial-lesson']

export async function POST(request: NextRequest) {
  const limit = await consumeRateLimit(RATE_LIMITS.freeTestIp, clientIp(request.headers))
  if (!limit.allowed) return rateLimitResponse(limit)

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'invalid_input' }, { status: 400 })

  const courseSlug = String(body.courseSlug || '')
  const lessonSlug = String(body.lessonSlug || '')
  const answers = body.answers

  if (!OPEN_COURSES.includes(courseSlug) || !lessonSlug) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }
  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true } })
  if (!course) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const lesson = await prisma.lesson.findUnique({
    where: { courseId_slug: { courseId: course.id, slug: lessonSlug } },
    select: { Assignment: { select: { answerKey: true }, take: 1 } }
  })

  const answerKey = lesson?.Assignment[0]?.answerKey
  if (!answerKey || typeof answerKey !== 'object') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const result = gradeAnswers(
    answerKey as Record<string, unknown>,
    answers as Record<string, unknown>
  )
  if (!result) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json({
    ok: true,
    grade: result.grade,
    correct: result.correct,
    total: result.total,
    wrongIds: result.wrongIds
  })
}
