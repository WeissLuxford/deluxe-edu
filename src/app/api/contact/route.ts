import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { normalizePhone, isValidUzPhone, normalizeEmail } from '@/features/auth/identity'
import { verifyTurnstile } from '@/lib/turnstile'
import { RATE_LIMITS, clientIp, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'

const locales = ['ru', 'uz', 'en'] as const
const sources = ['HOME_FORM', 'COURSE_PAGE', 'CONTACTS_PAGE', 'TRIAL_LESSON', 'LEVEL_TEST'] as const
const plans = ['FREE', 'BASIC', 'PRO', 'DELUXE'] as const

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().transform(normalizePhone).refine(isValidUzPhone),
  email: z.string().trim().transform(normalizeEmail).pipe(z.string().email().max(200)).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.enum(sources).default('HOME_FORM'),
  courseId: z.string().trim().min(1).optional(),
  plan: z.enum(plans).optional(),
  locale: z.enum(locales).default('ru')
})

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers)

  const limit = await consumeRateLimit(RATE_LIMITS.contactIp, ip)
  if (!limit.allowed) return rateLimitResponse(limit)

  const body = await request.json().catch(() => null)

  const captchaOk = await verifyTurnstile((body as any)?.turnstileToken, ip)
  if (!captchaOk) {
    return NextResponse.json({ error: 'captcha_failed' }, { status: 403 })
  }

  const normalized = body && typeof body === 'object' ? { ...body } : body
  if (normalized && typeof normalized === 'object') {
    for (const key of ['email', 'message', 'courseId', 'plan'] as const) {
      if (normalized[key] === '' || normalized[key] === null) delete normalized[key]
    }
  }

  const parsed = contactSchema.safeParse(normalized)

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { firstName, lastName, phone, email, message, source, courseId, plan, locale } = parsed.data

  try {
    const course = courseId
      ? await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
      : null

    await prisma.contactRequest.create({
      data: {
        firstName,
        lastName,
        phone,
        email: email ?? null,
        message: message ?? null,
        source,
        courseId: course?.id ?? null,
        plan: plan ?? null,
        locale,
        ip: ip === 'unknown' ? null : ip
      }
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
