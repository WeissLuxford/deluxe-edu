import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const bodySchema = z.object({
  lessonId: z.string().min(1),
  step: z.enum(['video', 'conspect', 'test'])
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    const { lessonId, step } = parsed.data

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true }
    })
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId: lesson.courseId, status: 'ACTIVE' },
      select: { id: true }
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }

    await prisma.$transaction([
      prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { lastStep: step },
        create: { userId, lessonId, lastStep: step, watched: false, passed: false }
      }),
      prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { lastLessonId: lessonId, lastVisitedAt: new Date() }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving lesson step:', error)
    return NextResponse.json({ error: 'Failed to save step' }, { status: 500 })
  }
}
