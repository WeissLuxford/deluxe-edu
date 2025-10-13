import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const sig = headers().get('stripe-signature') || ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ''
  let event
  try {
    const payload = await req.text()
    event = stripe.webhooks.constructEvent(payload, sig, secret)
  } catch {
    return new NextResponse('bad signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const s = event.data.object as any
    const meta = (s.metadata || {}) as Record<string, string>
    const userId = meta.userId
    const courseId = meta.courseId
    const courseSlug = meta.courseSlug
    if (userId && courseId) {
      const exists = await prisma.payment.findFirst({ where: { provider: 'stripe', providerRef: s.id } })
      if (!exists) {
        await prisma.payment.create({
          data: {
            userId,
            courseId,
            provider: 'stripe',
            providerRef: s.id,
            amountCents: s.amount_total ?? 0,
            currency: (s.currency || 'usd').toUpperCase(),
            status: 'paid'
          }
        })
      }
      const enr = await prisma.enrollment.findFirst({ where: { userId, courseId } })
      if (!enr) {
        await prisma.enrollment.create({ data: { userId, courseId, status: 'ACTIVE' } })
      } else if (enr.status !== 'ACTIVE') {
        await prisma.enrollment.update({ where: { id: enr.id }, data: { status: 'ACTIVE' } })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
