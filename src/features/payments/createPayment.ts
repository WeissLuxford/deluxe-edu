import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'
import { RATE_LIMITS, consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'

type Created =
  | { ok: true; payment: { id: string }; course: { slug: string; priceBasic: number }; locale: string }
  | { ok: false; response: Response }

// Shared first half of every checkout: who is paying comes from the session,
// never from the request body, otherwise anyone could open a payment on
// another account.
export async function createPendingPayment(req: Request, provider: 'payme' | 'click'): Promise<Created> {
  const auth = await authenticateRequest(req)
  if (auth.ok === false) return { ok: false, response: auth.response }
  const { userId } = auth.principal

  const limit = await consumeRateLimit(RATE_LIMITS.paymentCreateUser, userId)
  if (!limit.allowed) return { ok: false, response: rateLimitResponse(limit) }

  const body = (await req.json().catch(() => null)) as { courseSlug?: unknown; locale?: unknown } | null
  const courseSlug = typeof body?.courseSlug === 'string' ? body.courseSlug : ''
  const locale = typeof body?.locale === 'string' && ['ru', 'uz', 'en'].includes(body.locale) ? body.locale : auth.principal.locale
  if (!courseSlug) return { ok: false, response: NextResponse.json({ ok: false, error: 'no course' }, { status: 400 }) }

  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true, slug: true, priceBasic: true } })
  if (!course) return { ok: false, response: NextResponse.json({ ok: false, error: 'no course' }, { status: 404 }) }

  const payment = await prisma.payment.create({
    data: {
      userId,
      courseId: course.id,
      provider,
      providerRef: '',
      amountCents: course.priceBasic,
      currency: 'UZS',
      status: 'pending'
    },
    select: { id: true }
  })

  return { ok: true, payment, course, locale }
}
