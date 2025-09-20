import { NextResponse } from 'next/server'
import { stripe } from '@/lib/payments/stripe'
export async function POST(req: Request) {
  const raw = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET as string)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
  }
  return NextResponse.json({ ok: true })
}
