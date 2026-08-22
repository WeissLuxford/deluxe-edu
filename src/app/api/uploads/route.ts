import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { authenticateRequest } from '@/lib/apiAuth'
import { uploadToBunny, bunnyConfigured } from '@/lib/bunny'

const ALLOWED_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

const MAX_BYTES = 50 * 1024 * 1024

// Общий upload-эндпоинт для контента, который заводит админ (видео уроков,
// обложки, аудио диалогов). Запись голоса ученика загружается отдельным
// роутом — там нужна проверка владения попыткой, а не роль ADMIN.
export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (auth.ok === false) return auth.response
  if (auth.principal.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!bunnyConfigured()) {
    return NextResponse.json({ error: 'Storage is not configured' }, { status: 503 })
  }

  const form = await req.formData()
  const file = form.get('file')
  const folderRaw = String(form.get('folder') ?? '')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File is too large' }, { status: 400 })
  }

  const folder = /^[a-z0-9-]+$/.test(folderRaw) ? folderRaw : 'misc'
  const path = `uploads/${folder}/${randomUUID()}.${ext}`

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToBunny(buffer, path, file.type)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload to Bunny failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 502 })
  }
}
