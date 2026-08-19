import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { prisma } from '@/lib/db'
import { normalizeEmail } from '@/features/auth/identity'
import { sendPasswordResetEmail, mailerConfigured } from '@/lib/mailer'
import { verifyTurnstile } from '@/lib/turnstile'
import { RATE_LIMITS, clientIp, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers)
  const body = await request.json().catch(() => null)
  const email = normalizeEmail(String((body as any)?.email || ''))

  const captchaOk = await verifyTurnstile((body as any)?.turnstileToken, ip)
  if (!captchaOk) return NextResponse.json({ error: 'captcha_failed' }, { status: 403 })

  if (!email) return NextResponse.json({ ok: true })

  const limit = await consumeRateLimit(RATE_LIMITS.forgotIdentifier, email)
  if (!limit.allowed) return rateLimitResponse(limit)

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, locale: true }
  })

  if (user?.email && mailerConfigured()) {
    await prisma.verificationToken.updateMany({
      where: { userId: user.id, purpose: 'PASSWORD_RESET', usedAt: null },
      data: { usedAt: new Date() }
    })

    const token = crypto.randomBytes(32).toString('base64url')
    await prisma.verificationToken.create({
      data: {
        token,
        purpose: 'PASSWORD_RESET',
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    })

    const base = process.env.NEXTAUTH_URL || ''
    await sendPasswordResetEmail(
      user.email,
      `${base}/${user.locale || 'ru'}/reset-password?token=${encodeURIComponent(token)}`,
      user.locale
    )
  }

  return NextResponse.json({ ok: true })
}
