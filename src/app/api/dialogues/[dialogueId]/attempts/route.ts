import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'
import { isLessonAccessible } from '@/features/learn/progress'

export async function POST(req: NextRequest, { params }: { params: Promise<{ dialogueId: string }> }) {
  try {
    const { dialogueId } = await params
    const auth = await authenticateRequest(req)
    if (auth.ok === false) return auth.response
    const userId = auth.principal.userId

    const { characterId } = await req.json()
    if (!characterId || typeof characterId !== 'string') {
      return NextResponse.json({ error: 'Missing characterId' }, { status: 400 })
    }

    const dialogue = await prisma.dialogue.findUnique({
      where: { id: dialogueId },
      select: { id: true, lessonId: true, characters: true }
    })
    if (!dialogue) {
      return NextResponse.json({ error: 'Dialogue not found' }, { status: 404 })
    }

    const characters = Array.isArray(dialogue.characters) ? (dialogue.characters as any[]) : []
    if (!characters.some(c => c.id === characterId)) {
      return NextResponse.json({ error: 'Unknown characterId' }, { status: 400 })
    }

    if (!(await isLessonAccessible(userId, dialogue.lessonId))) {
      return NextResponse.json({ error: 'Lesson is locked' }, { status: 403 })
    }

    const existing = await prisma.dialogueAttempt.findFirst({
      where: { dialogueId, userId },
      orderBy: { startedAt: 'desc' }
    })
    if (existing) {
      return NextResponse.json({ attemptId: existing.id, characterId: existing.characterId, status: existing.status })
    }

    const attempt = await prisma.dialogueAttempt.create({
      data: { dialogueId, userId, characterId }
    })

    return NextResponse.json({ attemptId: attempt.id, characterId: attempt.characterId, status: attempt.status })
  } catch (error) {
    console.error('Error creating dialogue attempt:', error)
    return NextResponse.json({ error: 'Failed to start dialogue' }, { status: 500 })
  }
}
