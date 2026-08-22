import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params
    const auth = await authenticateRequest(req)
    if (auth.ok === false) return auth.response
    const userId = auth.principal.userId

    const attempt = await prisma.dialogueAttempt.findUnique({
      where: { id: attemptId },
      include: { dialogue: { select: { lines: true } }, recordings: { select: { lineId: true } } }
    })
    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    const lines = Array.isArray(attempt.dialogue.lines) ? (attempt.dialogue.lines as any[]) : []
    const ownLineIds = lines.filter(l => l.characterId === attempt.characterId).map(l => l.id)
    const recordedIds = new Set(attempt.recordings.map(r => r.lineId))
    const missing = ownLineIds.filter(id => !recordedIds.has(id))

    if (missing.length > 0) {
      return NextResponse.json({ error: 'Not all lines are recorded yet', missing }, { status: 400 })
    }

    await prisma.dialogueAttempt.update({
      where: { id: attemptId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing dialogue attempt:', error)
    return NextResponse.json({ error: 'Failed to complete dialogue' }, { status: 500 })
  }
}
