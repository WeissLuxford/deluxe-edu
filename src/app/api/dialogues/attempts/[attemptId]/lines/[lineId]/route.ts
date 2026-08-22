import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'
import { uploadToBunny, bunnyConfigured } from '@/lib/bunny'

const ALLOWED_TYPES: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav'
}

const MAX_BYTES = 10 * 1024 * 1024

// Отдельный роут (не общий /api/uploads): здесь нужна проверка владения
// попыткой, а не роль ADMIN — запись оставляет сам ученик.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string; lineId: string }> }
) {
  try {
    const { attemptId, lineId } = await params
    const auth = await authenticateRequest(req)
    if (auth.ok === false) return auth.response
    const userId = auth.principal.userId

    const attempt = await prisma.dialogueAttempt.findUnique({
      where: { id: attemptId },
      include: { dialogue: { select: { lines: true } } }
    })
    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }
    if (attempt.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Attempt already completed' }, { status: 409 })
    }

    const lines = Array.isArray(attempt.dialogue.lines) ? (attempt.dialogue.lines as any[]) : []
    const line = lines.find(l => l.id === lineId)
    if (!line) {
      return NextResponse.json({ error: 'Line not found' }, { status: 404 })
    }
    if (line.characterId !== attempt.characterId) {
      return NextResponse.json({ error: 'This line does not belong to your character' }, { status: 403 })
    }

    if (!bunnyConfigured()) {
      return NextResponse.json({ error: 'Storage is not configured' }, { status: 503 })
    }

    const form = await req.formData()
    const file = form.get('audio')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing audio' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Unsupported audio type' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Recording is too large' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const path = `dialogue-recordings/${attemptId}/${lineId}.${ext}`
    const url = await uploadToBunny(buffer, path, file.type)

    await prisma.dialogueLineRecording.upsert({
      where: { attemptId_lineId: { attemptId, lineId } },
      update: { audioUrl: url },
      create: { attemptId, lineId, audioUrl: url }
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error saving dialogue line recording:', error)
    return NextResponse.json({ error: 'Failed to save recording' }, { status: 502 })
  }
}
