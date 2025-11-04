import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Можно добавить email отправку позже
// import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, phone, email, message } = body

    // Валидация
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      )
    }

    // Сохраняем в БД (создадим модель ContactRequest)
    // const contactRequest = await prisma.contactRequest.create({
    //   data: {
    //     firstName,
    //     lastName,
    //     phone,
    //     email: email || null,
    //     message: message || null,
    //   }
    // })

    // Временно логируем в консоль (пока нет модели в Prisma)
    console.log('📞 New contact request:', {
      firstName,
      lastName,
      phone,
      email,
      message,
      timestamp: new Date().toISOString()
    })

    // TODO: Отправить email уведомление админу
    // await sendEmailToAdmin({ firstName, lastName, phone, email, message })

    // TODO: Отправить SMS уведомление (опционально)
    // await sendSMS(phone, 'Thank you for contacting Deluxe Edu!')

    return NextResponse.json(
      { success: true, message: 'Contact request received' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact request' },
      { status: 500 }
    )
  }
}