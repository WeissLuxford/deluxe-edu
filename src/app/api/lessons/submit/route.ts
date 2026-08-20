import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'
import { gradeAnswers } from '@/features/courses/grading'

const PASSING_SCORE = 70

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.ok === false) return auth.response
    const userId = auth.principal.userId

    const { assignmentId, answers } = await req.json()
    if (!assignmentId || typeof answers !== 'object' || answers === null) {
      return NextResponse.json({ error: 'Missing assignmentId or answers' }, { status: 400 })
    }

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

    const result = assignment.answerKey
      ? gradeAnswers(assignment.answerKey as Record<string, unknown>, answers)
      : null

    await prisma.submission.create({
      data: { assignmentId, userId, answer: answers, grade: result?.grade ?? null }
    })

    if (result === null) {
      return NextResponse.json(
        { error: 'Assignment has no answer key yet' },
        { status: 409 }
      )
    }

    const passed = result.grade >= PASSING_SCORE
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: assignment.lesson.id } },
      update: { watched: true, passed },
      create: { userId, lessonId: assignment.lesson.id, watched: true, passed }
    })

    return NextResponse.json({
      success: true,
      passed,
      grade: result.grade,
      correct: result.correct,
      total: result.total,
      wrongIds: result.wrongIds,
      passingScore: PASSING_SCORE
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ error: 'Failed to submit test' }, { status: 500 })
  }
}
