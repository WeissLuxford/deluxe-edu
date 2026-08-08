// src/app/api/lessons/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const PASSING_SCORE = 70

/**
 * Формат answerKey в базе: { "<questionId>": <правильный ответ> }
 * Строка — для типов single/text, массив строк — для multiple.
 * Оценку считает ТОЛЬКО сервер: клиенту доверять нельзя.
 */
function gradeAnswers(answerKey: Record<string, unknown>, answers: Record<string, unknown>) {
  const questionIds = Object.keys(answerKey)
  if (questionIds.length === 0) return null

  let correct = 0
  for (const id of questionIds) {
    const expected = answerKey[id]
    const given = answers?.[id]

    if (Array.isArray(expected)) {
      if (
        Array.isArray(given) &&
        given.length === expected.length &&
        given.every(a => expected.includes(a))
      ) {
        correct++
      }
    } else if (typeof expected === 'string' && typeof given === 'string') {
      if (given.trim().toLowerCase() === expected.trim().toLowerCase()) correct++
    }
  }

  return Math.round((correct / questionIds.length) * 100)
}

export async function POST(req: NextRequest) {
  try {
    // userId берём ТОЛЬКО из сессии, никогда из тела запроса
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId, answers } = await req.json()
    if (!assignmentId || typeof answers !== 'object' || answers === null) {
      return NextResponse.json({ error: 'Missing assignmentId or answers' }, { status: 400 })
    }

    // lessonId и courseId берём из базы по assignmentId, а не с клиента
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { lesson: { select: { id: true, courseId: true } } }
    })
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId: assignment.lesson.courseId, status: 'ACTIVE' }
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }

    const grade = assignment.answerKey
      ? gradeAnswers(assignment.answerKey as Record<string, unknown>, answers)
      : null

    await prisma.submission.create({
      data: { assignmentId, userId, answer: answers, grade }
    })

    // Без answerKey оценить нечего — засчитывать прохождение нельзя
    if (grade === null) {
      return NextResponse.json(
        { error: 'Assignment has no answer key yet' },
        { status: 409 }
      )
    }

    const passed = grade >= PASSING_SCORE
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: assignment.lesson.id } },
      update: { watched: true, passed },
      create: { userId, lessonId: assignment.lesson.id, watched: true, passed }
    })

    return NextResponse.json({ success: true, passed, grade, passingScore: PASSING_SCORE })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ error: 'Failed to submit test' }, { status: 500 })
  }
}
