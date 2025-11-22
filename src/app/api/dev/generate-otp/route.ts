import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ⚠️ ТОЛЬКО ДЛЯ РАЗРАБОТКИ! Удали в продакшне

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone')
  
  if (!phone) {
    return NextResponse.json({ error: 'Phone required' }, { status: 400 })
  }

  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  // Удаляем старые коды
  await prisma.oTPCode.deleteMany({
    where: { phone, used: false }
  })

  // Создаем новый
  await prisma.oTPCode.create({
    data: { phone, code, expiresAt }
  })

  return NextResponse.json({
    success: true,
    phone,
    code,
    expiresAt,
    note: 'Dev only - use this code for testing'
  })
}