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
      select: { id: true, courseId: true }
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

    if (!(await isLessonAccessible(userId, lessonId))) {
      return NextResponse.json({ error: 'Lesson is locked' }, { status: 403 })
    }

    const limit = await assertWithinDailyLimit(userId, lessonId)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'daily_limit_reached', resetAt: limit.resetAt }, { status: 403 })
    }

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { watched: true },
      create: { userId, lessonId, watched: true, passed: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking lesson as watched:', error)
    return NextResponse.json({ error: 'Failed to mark as watched' }, { status: 500 })
  }
}
