import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { prisma } from '@/lib/db'
import { normalizeEmail } from '@/features/auth/identity'
import { sendVerificationEmail, mailerConfigured } from '@/lib/mailer'
import { verifyTurnstile } from '@/lib/turnstile'
import { RATE_LIMITS, clientIp, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers)
  const body = await req.json().catch(() => null)
  const email = normalizeEmail(String((body as any)?.email || ''))

  if (!email) return NextResponse.json({ ok: true, delivered: mailerConfigured() })

  const captchaOk = await verifyTurnstile((body as any)?.turnstileToken, ip)
  if (!captchaOk) return NextResponse.json({ error: 'captcha_failed' }, { status: 403 })

  const limit = await consumeRateLimit(RATE_LIMITS.resendEmail, email)
  if (!limit.allowed) return rateLimitResponse(limit)

  if (!mailerConfigured()) {
    return NextResponse.json({ ok: true, delivered: false })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerified: true, locale: true }
  })

  if (!user || user.emailVerified || !user.email) {
    return NextResponse.json({ ok: true, delivered: true })
  }

  const token = crypto.randomBytes(32).toString('base64url')
  await prisma.verificationToken.create({
    data: {
      token,
      purpose: 'EMAIL_VERIFY',
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    }
  })

  const base = process.env.NEXTAUTH_URL || ''
  await sendVerificationEmail(user.email, `${base}/api/verify?token=${encodeURIComponent(token)}`, user.locale)

  return NextResponse.json({ ok: true, delivered: true })
}
