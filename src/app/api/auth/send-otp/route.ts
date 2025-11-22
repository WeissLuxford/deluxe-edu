import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendOTP } from '@/lib/sms'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Валидация номера
    if (!phone || phone.length !== 12 || !phone.startsWith('998')) {
      return NextResponse.json(
        { error: 'Invalid phone number. Expected format: 998901234567' },
        { status: 400 }
      )
    }

    // Проверяем существует ли юзер
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      )
    }

    // Генерируем код
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

    // Удаляем старые неиспользованные коды для этого номера
    await prisma.oTPCode.deleteMany({
      where: {
        phone,
        used: false
      }
    })

    // Сохраняем новый OTP
    await prisma.oTPCode.create({
      data: {
        phone,
        code,
        expiresAt
      }
    })

    console.log(`🔐 Generated OTP for ${phone}: ${code}`)

    // ✅ ИСПРАВЛЕНО: Оборачиваем в try-catch чтобы ошибки Eskiz не ломали API
    try {
      await sendOTP(phone, code)
    } catch (smsError: any) {
      // Логируем ошибку но НЕ возвращаем 500
      console.error('⚠️ SMS send warning:', smsError.message)
      
      // В продакшне можно вернуть ошибку, в тестовом - пропускаем
      const IS_TEST = process.env.ESKIZ_TEST_MODE === 'true'
      if (!IS_TEST) {
        throw smsError
      }
      // В тестовом режиме продолжаем даже если SMS "не отправлена"
      console.log('✅ Test mode: Continuing despite SMS error')
    }

    return NextResponse.json({ 
      success: true,
      testMode: process.env.ESKIZ_TEST_MODE === 'true' 
    })
  } catch (error: any) {
    console.error('❌ Send OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    )
  }
}