import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, checkBalance } from '@/lib/sms'

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone')
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone parameter required. Example: ?phone=998901234567' },
        { status: 400 }
      )
    }

    // Проверяем баланс
    const balance = await checkBalance()
    
    if (balance === 0) {
      return NextResponse.json(
        { error: 'No SMS balance available' },
        { status: 400 }
      )
    }

    // ⚠️ Для тестового аккаунта используем разрешенный текст
    await sendSMS(phone, 'This is test from Eskiz')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test SMS sent successfully!',
      balance,
      recipient: phone,
      note: 'Using test message (test account limitation)'
    })
  } catch (error: any) {
    console.error('❌ Test SMS error:', error)
    return NextResponse.json({ 
      error: error.message,
      details: String(error)
    }, { status: 500 })
  }
}