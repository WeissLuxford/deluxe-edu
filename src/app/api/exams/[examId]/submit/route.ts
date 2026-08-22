import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'
import { gradeAnswers, applyLenientTextGrading } from '@/features/courses/grading'
import { isHardGated } from '@/features/learn/groupGate'

export async function POST(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  try {
    const { examId } = await params
    const auth = await authenticateRequest(req)
    if (auth.ok === false) return auth.response
    const userId = auth.principal.userId

    const { answers } = await req.json()
    if (typeof answers !== 'object' || answers === null) {
      return NextResponse.json({ error: 'Missing answers' }, { status: 400 })
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { module: { select: { id: true, courseId: true, lessons: { select: { id: true } } } } }
    })
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId: exam.module.courseId, status: 'ACTIVE' }
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }

    // Экзамен доступен, только когда все уроки модуля пройдены — защита от
    // прямого вызова API в обход страницы.
    const lessonIds = exam.module.lessons.map(l => l.id)
    if (lessonIds.length > 0) {
      const passedCount = await prisma.lessonProgress.count({
        where: { userId, lessonId: { in: lessonIds }, passed: true }
      })
      if (passedCount < lessonIds.length) {
        return NextResponse.json({ error: 'Module is not finished yet' }, { status: 409 })
      }
    }

    let result = exam.answerKey
      ? gradeAnswers(exam.answerKey as Record<string, unknown>, answers)
      : null

    if (result === null) {
      return NextResponse.json({ error: 'Exam has no answer key yet' }, { status: 409 })
    }

    result = await applyLenientTextGrading(result, exam.prompt, exam.answerKey as Record<string, unknown>, answers)

    const hardGated = await isHardGated(userId)

    const attempt = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        userId,
        answer: answers,
        grade: result.grade,
        correct: result.correct,
        total: result.total,
        reviewStatus: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      grade: result.grade,
      correct: result.correct,
      total: result.total,
      wrongIds: result.wrongIds,
      passingScore: exam.passingScore,
      passed: result.grade >= exam.passingScore,
      hardGated
    })
  } catch (error) {
    console.error('Error submitting exam:', error)
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 })
  }
}
