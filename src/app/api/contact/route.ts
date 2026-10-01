import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { normalizePhone, isValidUzPhone, normalizeEmail } from '@/features/auth/identity'
import { verifyTurnstile } from '@/lib/turnstile'
import { RATE_LIMITS, clientIp, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { isKnownCampaign } from '@/features/leads/campaigns'

const locales = ['ru', 'uz', 'en'] as const
const sources = [
  'HOME_FORM',
  'COURSE_PAGE',
  'CONTACTS_PAGE',
  'TRIAL_LESSON',
  'LEVEL_TEST',
  'LANDING'
] as const
const plans = ['FREE', 'BASIC', 'PRO', 'DELUXE'] as const

// Campaign landings ask for a name and a phone number and nothing else, so the
// last name is optional here. It stays required in the signup route — that one
// creates an account.
const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().transform(normalizePhone).refine(isValidUzPhone),
  email: z.string().trim().transform(normalizeEmail).pipe(z.string().email().max(200)).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.enum(sources).default('HOME_FORM'),
  // Slug of the landing the lead came from. Checked against the registry in
  // src/content/campaigns.json, not just for shape: the column is what ad spend
  // gets attributed by, so an arbitrary string in it is a broken report later.
  campaign: z.string().trim().refine(isKnownCampaign, 'unknown_campaign').optional(),
  utm: z.record(z.string().max(50), z.string().max(200)).optional(),
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
    for (const key of ['lastName', 'email', 'message', 'campaign', 'courseId', 'plan'] as const) {
      if (normalized[key] === '' || normalized[key] === null) delete normalized[key]
    }
  }

  const parsed = contactSchema.safeParse(normalized)

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { firstName, lastName, phone, email, message, source, campaign, utm, courseId, plan, locale } =
    parsed.data

  // Ad traffic gets its own, tighter bucket on top of the site-wide one.
  if (source === 'LANDING') {
    const landingLimit = await consumeRateLimit(RATE_LIMITS.landingLeadIp, ip)
    if (!landingLimit.allowed) return rateLimitResponse(landingLimit)
  }

  try {
    const course = courseId
      ? await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
      : null

    await prisma.contactRequest.create({
      data: {
        firstName,
        lastName: lastName ?? null,
        phone,
        email: email ?? null,
        message: message ?? null,
        source,
        // Attribution only means something for a landing; elsewhere it would be
        // whatever the client felt like sending.
        campaign: source === 'LANDING' ? campaign ?? null : null,
        utm: source === 'LANDING' && utm ? utm : undefined,
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
