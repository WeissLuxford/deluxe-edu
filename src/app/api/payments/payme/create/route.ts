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
      provider: 'payme',
      providerRef: '',
      amountCents: course.priceBasic,
      currency: 'UZS',
      status: 'pending'
    }
  })

  const base = process.env.PAYME_TEST_MODE === '1' ? 'https://checkout.test.paycom.uz' : 'https://checkout.paycom.uz'
  const url = new URL(base)
  url.searchParams.set('m', process.env.PAYME_MERCHANT_ID as string)
  url.searchParams.set('ac.order_id', payment.id)
  url.searchParams.set('a', String(course.priceBasic))
  if (locale) url.searchParams.set('l', locale)

  return NextResponse.json({ ok: true, url: url.toString(), paymentId: payment.id })
}