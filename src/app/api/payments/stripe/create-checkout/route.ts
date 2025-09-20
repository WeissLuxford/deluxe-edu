import { NextResponse } from 'next/server'
import { stripe } from '@/lib/payments/stripe'
export async function POST(req: Request) {
  const { priceId, userId, locale } = await req.json()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/${locale}/dashboard`,
    cancel_url: `${process.env.APP_URL}/${locale}/pricing`,
    client_reference_id: userId,
    metadata: { priceId }
  })
  return NextResponse.json({ url: session.url })
}
