import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { normalizePhone, isValidUzPhone } from '@/features/auth/identity'
import { issuePhoneCode, deliverPhoneCode } from '@/features/auth/phoneCode'
import { verifyTurnstile } from '@/lib/turnstile'
import { RATE_LIMITS, clientIp, consumeRateLimits, rateLimitResponse } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const PURPOSES = ['REGISTER', 'BIND', 'RESET'] as const
type Purpose = (typeof PURPOSES)[number]

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers)
  const body = await request.json().catch(() => null)

  const phone = normalizePhone(String((body as any)?.phone ?? ''))
  const purpose = String((body as any)?.purpose ?? '') as Purpose

  if (!isValidUzPhone(phone) || !PURPOSES.includes(purpose)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const captchaOk = await verifyTurnstile((body as any)?.turnstileToken, ip)
  if (!captchaOk) return NextResponse.json({ error: 'captcha_failed' }, { status: 403 })

  const limit = await consumeRateLimits([
    { rule: RATE_LIMITS.otpPhoneBurst, scope: phone },
    { rule: RATE_LIMITS.otpPhoneDaily, scope: phone },
    { rule: RATE_LIMITS.otpIp, scope: ip }
  ])
  if (!limit.allowed) return rateLimitResponse(limit)

  const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true } })

  let userId: string | undefined

  if (purpose === 'REGISTER') {
    if (existing) return NextResponse.json({ error: 'phone_taken' }, { status: 409 })
  }

  if (purpose === 'BIND') {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: 'phone_taken' }, { status: 409 })
    }
    userId = session.user.id
  }

  if (purpose === 'RESET') {
    if (!existing) {
      return NextResponse.json({ ok: true, retryAfter: RATE_LIMITS.otpPhoneBurst.windowMs / 1000 })
    }
    userId = existing.id
  }

  try {
    const { code } = await issuePhoneCode(phone, purpose, { userId, ip })
    await deliverPhoneCode(phone, code)
  } catch {
    return NextResponse.json({ error: 'sms_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, retryAfter: RATE_LIMITS.otpPhoneBurst.windowMs / 1000 })
}
