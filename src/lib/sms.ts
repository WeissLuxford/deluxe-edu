const ESKIZ_EMAIL = process.env.ESKIZ_EMAIL!
const ESKIZ_PASSWORD = process.env.ESKIZ_PASSWORD!
const ESKIZ_API = 'https://notify.eskiz.uz/api'

interface EskizAuthResponse {
  message: string
  data: {
    token: string
  }
  token_type?: string
}

interface EskizSendResponse {
  status: string
  message: string
  id?: string
}

interface EskizBalanceResponse {
  status: string
  data?: {
    balance: number
  }
}

let cachedToken: string | null = null
let tokenExpiresAt: number = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    console.log('✅ Using cached token')
    return cachedToken
  }

  console.log('🔑 Requesting new token from Eskiz...')

  try {
    const res = await fetch(`${ESKIZ_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ESKIZ_EMAIL,
        password: ESKIZ_PASSWORD
      })
    })

    const responseText = await res.text()
    console.log('📥 Eskiz auth response:', responseText)

    if (!res.ok) {
      throw new Error(`Eskiz auth failed: ${res.status} - ${responseText}`)
    }

    const data: EskizAuthResponse = JSON.parse(responseText)
    
    if (!data.data?.token) {
      throw new Error('No token in response')
    }

    cachedToken = data.data.token
    tokenExpiresAt = Date.now() + 29 * 24 * 60 * 60 * 1000 // 29 дней
    
    console.log('✅ Token obtained successfully')
    return cachedToken
  } catch (error) {
    console.error('❌ Eskiz auth error:', error)
    throw error
  }
}

export async function sendSMS(phone: string, message: string): Promise<void> {
  try {
    if (!phone.startsWith('998') || phone.length !== 12) {
      throw new Error(`Invalid phone format: ${phone}. Expected: 998901234567`)
    }

    let finalMessage = message
    const IS_TEST = process.env.ESKIZ_TEST_MODE === 'true'
    
    if (IS_TEST) {
      console.log('⚠️ Test mode enabled, using approved message')
      finalMessage = 'This is test from Eskiz'
    }

    console.log(`📤 Sending SMS to: ${phone}`)
    console.log(`💬 Message: ${finalMessage}`)

    const authToken = await getToken()

    const res = await fetch(`${ESKIZ_API}/message/sms/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile_phone: phone,
        message: finalMessage,
        from: '4546',
        callback_url: `${process.env.NEXTAUTH_URL}/api/sms/callback`
      })
    })

    const responseText = await res.text()
    console.log('📥 Eskiz send response:', responseText)

    if (!res.ok && res.status !== 400) {
      if (res.status === 401) {
        console.log('🔄 Token expired, refreshing...')
        cachedToken = null
        tokenExpiresAt = 0
        return sendSMS(phone, message)
      }
      
      throw new Error(`Eskiz SMS send failed: ${res.status} - ${responseText}`)
    }

    const data: EskizSendResponse = JSON.parse(responseText)
    
    const isSuccess = 
      data.id !== undefined ||  // Если есть ID - SMS отправлена
      data.status === 'success' || 
      data.message.toLowerCase().includes('success') ||
      data.message.toLowerCase().includes('waiting')

    if (isSuccess) {
      console.log('✅ SMS sent successfully, ID:', data.id)
      if (IS_TEST) {
        console.log('⚠️ Test mode: SMS sent with standard test message')
      }
    } else {
      throw new Error(`SMS send failed: ${data.message}`)
    }
  } catch (error) {
    console.error('❌ SMS send error:', error)
    throw error
  }
}

export async function checkBalance(): Promise<number> {
  try {
    console.log('💰 Checking SMS balance...')
    
    const authToken = await getToken()
    
    const res = await fetch(`${ESKIZ_API}/user/get-limit`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    const responseText = await res.text()
    console.log('📥 Balance response:', responseText)

    if (!res.ok) {
      throw new Error(`Balance check failed: ${res.status}`)
    }

    const data: EskizBalanceResponse = JSON.parse(responseText)
    const balance = data.data?.balance || 0
    
    console.log(`✅ Balance: ${balance} SMS`)
    return balance
  } catch (error) {
    console.error('❌ Balance check error:', error)
    return 0
  }
}

export async function sendOTP(phone: string, code: string): Promise<void> {
  const IS_TEST = process.env.ESKIZ_TEST_MODE === 'true'
  
  if (IS_TEST) {
    await sendSMS(phone, 'This is test from Eskiz')
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔐 TEST MODE - OTP CODE')
    console.log(`📱 Phone: ${phone}`)
    console.log(`🔑 Code:  ${code}`)
    console.log('⚠️  SMS sent with test message')
    console.log('💡 Use this code for verification')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } else {
    const message = `Your Vertex Edu verification code: ${code}\n\nDo not share this code with anyone.`
    await sendSMS(phone, message)
  }
}