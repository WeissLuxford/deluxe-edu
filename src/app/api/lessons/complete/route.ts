import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'
import { assertWithinDailyLimit } from '@/features/courses/dailyLimit'
import { isLessonAccessible } from '@/features/learn/progress'

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.ok === false) return auth.response
    const userId = auth.principal.userId

    const { lessonId } = await req.json()
    if (!lessonId) {
      return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 })
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true, Assignment: { select: { id: true }, take: 1 } }
    })
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId: lesson.courseId, status: 'ACTIVE' }
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }

    if (lesson.Assignment.length > 0) {
      return NextResponse.json(
        { error: 'Lesson has a test, submit it instead' },
        { status: 409 }
      )
    }

    if (!(await isLessonAccessible(userId, lessonId))) {
      return NextResponse.json({ error: 'Lesson is locked' }, { status: 403 })
    }

    const limit = await assertWithinDailyLimit(userId, lessonId)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'daily_limit_reached', resetAt: limit.resetAt }, { status: 403 })
    }

    const existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { passed: true, passedAt: true }
    })
    const passedAt = existing?.passed ? existing.passedAt : new Date()

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { watched: true, passed: true, passedAt },
      create: { userId, lessonId, watched: true, passed: true, passedAt }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 })
  }
}
