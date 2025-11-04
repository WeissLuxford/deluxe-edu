// src/app/api/lessons/watch/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { lessonId, userId } = await req.json()

    if (!lessonId || !userId) {
      return NextResponse.json({ error: 'Missing lessonId or userId' }, { status: 400 })
    }

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: {
        watched: true
      },
      create: {
        userId,
        lessonId,
        watched: true,
        passed: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking lesson as watched:', error)
    return NextResponse.json({ error: 'Failed to mark as watched' }, { status: 500 })
  }
}