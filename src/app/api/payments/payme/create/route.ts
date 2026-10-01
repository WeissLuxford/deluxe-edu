import { NextResponse } from 'next/server'
import { createPendingPayment } from '@/features/payments/createPayment'

export async function POST(req: Request) {
  const created = await createPendingPayment(req, 'payme')
  if (created.ok === false) return created.response
  const { payment, course, locale } = created

  const base = process.env.PAYME_TEST_MODE === '1' ? 'https://checkout.test.paycom.uz' : 'https://checkout.paycom.uz'
  const url = new URL(base)
  url.searchParams.set('m', process.env.PAYME_MERCHANT_ID as string)
  url.searchParams.set('ac.order_id', payment.id)
  url.searchParams.set('a', String(course.priceBasic))
  url.searchParams.set('l', locale)

  return NextResponse.json({ ok: true, url: url.toString(), paymentId: payment.id })
}
