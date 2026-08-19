import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { normalizeEmail } from '@/features/auth/identity'
import { isStrongEnough, hashPassword } from '@/features/auth/password'
import { consumeTicket } from '@/features/auth/phoneCode'
import { verifyTurnstile } from '@/lib/turnstile'
import { RATE_LIMITS, clientIp, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { sendVerificationEmail, mailerConfigured } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

const LOCALES = ['ru', 'uz', 'en']

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers)
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null

  if (!body) return fail('invalid_input', 400)

  const captchaOk = await verifyTurnstile(body.turnstileToken, ip)
  if (!captchaOk) return fail('captcha_failed', 403)

  const limit = await consumeRateLimit(RATE_LIMITS.registerIp, ip)
  if (!limit.allowed) return rateLimitResponse(limit)

  const method = String(body.method || '')
  const firstName = String(body.firstName || '').trim()
  const lastName = String(body.lastName || '').trim()
  const password = String(body.password || '')
  const confirm = String(body.confirm || '')
  const locale = LOCALES.includes(String(body.locale)) ? String(body.locale) : 'ru'

  if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
    return fail('invalid_input', 400)
  }

  if (!isStrongEnough(password)) return fail('weak_password', 400)
  if (password !== confirm) return fail('password_mismatch', 400)

  const common = {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    role: 'STUDENT' as const,
    locale,
    passwordHash: await hashPassword(password),
    passwordChangedAt: new Date()
  }

  if (method === 'phone') {
    const ticket = await consumeTicket(body.ticket, 'REGISTER')
    if (!ticket.ok) return fail('invalid_ticket', 400)

    try {
      await prisma.user.create({
        data: { ...common, phone: ticket.phone, phoneVerified: new Date() },
        select: { id: true }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return fail('phone_taken', 409)
      }
      return fail('server', 500)
    }

    return NextResponse.json({ ok: true, identifier: ticket.phone, canSignIn: true })
  }

  if (method === 'email') {
    const email = normalizeEmail(String(body.email || ''))
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
      return fail('invalid_input', 400)
    }

    let userId: string
    try {
      const created = await prisma.user.create({
        data: { ...common, email },
        select: { id: true }
      })
      userId = created.id
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return fail('email_taken', 409)
      }
      return fail('server', 500)
    }

    let delivered = false

    if (mailerConfigured()) {
      const token = crypto.randomBytes(32).toString('base64url')
      await prisma.verificationToken.create({
        data: {
          token,
          purpose: 'EMAIL_VERIFY',
          userId,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        }
      })
      const base = process.env.NEXTAUTH_URL || ''
      delivered = await sendVerificationEmail(
        email,
        `${base}/api/verify?token=${encodeURIComponent(token)}`,
        locale
      )
    }

    return NextResponse.json({ ok: true, identifier: email, canSignIn: false, emailDelivered: delivered })
  }

  return fail('invalid_input', 400)
}
