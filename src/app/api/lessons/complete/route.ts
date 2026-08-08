// src/app/api/lessons/complete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * Отмечает урок пройденным, когда проверять нечего.
 *
 * Доступ к следующему уроку открывается по passed у предыдущего, а passed
 * выставляла только отправка теста. На уроке без теста студент застревал
 * навсегда.
 *
 * Ориентируемся на наличие задания в базе, а не на флаг hasTest: если
 * галочка стоит, но вопросы ещё не заведены, оценивать всё равно нечего,
 * и держать студента запертым нельзя.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // У урока есть задание — пройти его можно только сдав тест
    if (lesson.Assignment.length > 0) {
      return NextResponse.json(
        { error: 'Lesson has a test, submit it instead' },
        { status: 409 }
      )
    }

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { watched: true, passed: true },
      create: { userId, lessonId, watched: true, passed: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 })
  }
}
