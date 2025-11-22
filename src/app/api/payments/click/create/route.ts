import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const body = await req.json()
  const { courseSlug, locale } = body || {}
  if (!courseSlug) return NextResponse.json({ ok: false, error: 'no course' }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
  if (!course) return NextResponse.json({ ok: false, error: 'no course' }, { status: 404 })

  const userId = body.userId || 'guest'
  const payment = await prisma.payment.create({
    data: {
      userId,
      courseId: course.id,
      provider: 'click',
      providerRef: '',
      amountCents: course.priceBasic,
      currency: 'UZS',
      status: 'pending'
    }
  })

  const base = process.env.CLICK_GATEWAY_URL || ''
  if (!base) return NextResponse.json({ ok: false, error: 'CLICK_GATEWAY_URL not set' }, { status: 500 })

  const origin = new URL(req.url).origin
  const url = new URL(base)
  if (process.env.CLICK_MERCHANT_ID) url.searchParams.set('merchant_id', process.env.CLICK_MERCHANT_ID)
  if (process.env.CLICK_SERVICE_ID) url.searchParams.set('service_id', process.env.CLICK_SERVICE_ID)
  url.searchParams.set('amount', String(course.priceBasic))
  url.searchParams.set('transaction_param', payment.id)
  url.searchParams.set('return_url', `${origin}/${locale}/courses/${courseSlug}`)

  return NextResponse.json({ ok: true, url: url.toString(), paymentId: payment.id })
}