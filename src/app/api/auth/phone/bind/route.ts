import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { consumeTicket } from '@/features/auth/phoneCode'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const ticket = await consumeTicket((body as any)?.ticket, 'BIND')

  if (!ticket.ok || !ticket.phone) {
    return NextResponse.json({ ok: false, error: 'invalid_ticket' }, { status: 400 })
  }

  if (ticket.userId && ticket.userId !== session.user.id) {
    return NextResponse.json({ ok: false, error: 'invalid_ticket' }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone: ticket.phone, phoneVerified: new Date() }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'phone_taken' }, { status: 409 })
    }
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, phone: ticket.phone })
}
