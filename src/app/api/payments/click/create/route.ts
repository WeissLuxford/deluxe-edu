import { NextResponse } from 'next/server'
import { createPendingPayment } from '@/features/payments/createPayment'

export async function POST(req: Request) {
  const base = process.env.CLICK_GATEWAY_URL || ''
  if (!base) return NextResponse.json({ ok: false, error: 'CLICK_GATEWAY_URL not set' }, { status: 500 })

  const created = await createPendingPayment(req, 'click')
  if (created.ok === false) return created.response
  const { payment, course, locale } = created

  const origin = new URL(req.url).origin
  const url = new URL(base)
  if (process.env.CLICK_MERCHANT_ID) url.searchParams.set('merchant_id', process.env.CLICK_MERCHANT_ID)
  if (process.env.CLICK_SERVICE_ID) url.searchParams.set('service_id', process.env.CLICK_SERVICE_ID)
  url.searchParams.set('amount', String(course.priceBasic))
  url.searchParams.set('transaction_param', payment.id)
  url.searchParams.set('return_url', `${origin}/${locale}/courses/${course.slug}`)

  return NextResponse.json({ ok: true, url: url.toString(), paymentId: payment.id })
}
