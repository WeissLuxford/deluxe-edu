import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone and code are required' },
        { status: 400 }
      )
    }

    // Ищем OTP
    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // Отмечаем как использованный
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { used: true }
    })

    console.log(`✅ OTP verified for ${phone}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}