const ESKIZ_API = 'https://notify.eskiz.uz/api'
const TOKEN_TTL_MS = 29 * 24 * 60 * 60 * 1000

interface EskizAuthResponse {
  message: string
  data: { token: string }
  token_type?: string
}

interface EskizSendResponse {
  status?: string
  message?: string
  id?: string
}

interface EskizBalanceResponse {
  status: string
  data?: { balance: number }
}

let cachedToken: string | null = null
let tokenExpiresAt = 0

export function isTestMode(): boolean {
  return process.env.ESKIZ_TEST_MODE === 'true'
}

function credentials() {
  const email = process.env.ESKIZ_EMAIL
  const password = process.env.ESKIZ_PASSWORD
  if (!email || !password) throw new Error('eskiz_not_configured')
  return { email, password }
}

async function getToken(force = false): Promise<string> {
  if (!force && cachedToken && Date.now() < tokenExpiresAt) return cachedToken

  const res = await fetch(`${ESKIZ_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials())
  })

  if (!res.ok) throw new Error(`eskiz_auth_failed_${res.status}`)

  const data = (await res.json()) as EskizAuthResponse
  if (!data.data?.token) throw new Error('eskiz_auth_no_token')

  cachedToken = data.data.token
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS
  return cachedToken
}

async function postMessage(phone: string, message: string, token: string) {
  return fetch(`${ESKIZ_API}/message/sms/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mobile_phone: phone,
      message,
      from: '4546',
      callback_url: `${process.env.NEXTAUTH_URL}/api/sms/callback`
    })
  })
}

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (!/^998\d{9}$/.test(phone)) throw new Error('invalid_phone')

  const finalMessage = isTestMode() ? 'This is test from Eskiz' : message

  let token = await getToken()
  let res = await postMessage(phone, finalMessage, token)

  if (res.status === 401) {
    token = await getToken(true)
    res = await postMessage(phone, finalMessage, token)
  }

  if (!res.ok && res.status !== 400) {
    throw new Error(`eskiz_send_failed_${res.status}`)
  }

  const raw = await res.text()
  let data: EskizSendResponse = {}
  try {
    data = JSON.parse(raw) as EskizSendResponse
  } catch {
    throw new Error('eskiz_bad_response')
  }

  const note = (data.message || '').toLowerCase()
  const ok = data.id !== undefined || data.status === 'success' || note.includes('success') || note.includes('waiting')

  if (!ok) throw new Error('eskiz_send_rejected')
}

export async function checkBalance(): Promise<number> {
  try {
    const token = await getToken()
    const res = await fetch(`${ESKIZ_API}/user/get-limit`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) return 0

    const data = (await res.json()) as EskizBalanceResponse
    return data.data?.balance || 0
  } catch {
    return 0
  }
}

export async function sendOTP(phone: string, code: string): Promise<void> {
  if (isTestMode() && process.env.NODE_ENV !== 'production') {
    console.log(`[eskiz test mode] код для ${phone}: ${code}`)
  }

  if (isTestMode()) {
    await sendSMS(phone, 'This is test from Eskiz')
    return
  }

  await sendSMS(phone, `Your Highgate Edu verification code: ${code}\n\nDo not share this code with anyone.`)
}
