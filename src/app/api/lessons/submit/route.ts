// src/app/api/lessons/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { assignmentId, lessonId, userId, answer, grade } = await req.json()

    if (!assignmentId || !lessonId || !userId || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create submission
    await prisma.submission.create({
      data: {
        assignmentId,
        userId,
        answer,
        grade
      }
    })

    // Update lesson progress
    const passed = grade >= 70
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: {
        watched: true,
        passed
      },
      create: {
        userId,
        lessonId,
        watched: true,
        passed
      }
    })

    return NextResponse.json({ success: true, passed, grade })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ error: 'Failed to submit test' }, { status: 500 })
  }
}