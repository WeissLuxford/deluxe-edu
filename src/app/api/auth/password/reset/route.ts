import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isStrongEnough, applyNewPassword } from '@/features/auth/password'
import { consumeTicket } from '@/features/auth/phoneCode'

export const dynamic = 'force-dynamic'

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return fail('invalid_input', 400)

  const password = String(body.password || '')
  const confirm = String(body.confirm || '')

  if (!isStrongEnough(password)) return fail('weak_password', 400)
  if (password !== confirm) return fail('password_mismatch', 400)

  if (typeof body.ticket === 'string') {
    const ticket = await consumeTicket(body.ticket, 'RESET')
    if (!ticket.ok || !ticket.phone) return fail('invalid_ticket', 400)

    const user = await prisma.user.findUnique({ where: { phone: ticket.phone }, select: { id: true } })
    if (!user) return fail('invalid_ticket', 400)

    await applyNewPassword(user.id, password)
    await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: new Date() } })

    return NextResponse.json({ ok: true, identifier: ticket.phone })
  }

  if (typeof body.token === 'string') {
    const record = await prisma.verificationToken.findUnique({
      where: { token: body.token },
      select: { id: true, userId: true, purpose: true, usedAt: true, expiresAt: true }
    })

    if (!record || record.purpose !== 'PASSWORD_RESET') return fail('invalid_token', 400)
    if (record.usedAt) return fail('used_token', 400)
    if (record.expiresAt < new Date()) return fail('expired_token', 400)

    const spent = await prisma.verificationToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() }
    })

    if (spent.count === 0) return fail('used_token', 400)

    await applyNewPassword(record.userId, password)

    const user = await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
      select: { email: true }
    })

    return NextResponse.json({ ok: true, identifier: user.email })
  }

  return fail('invalid_input', 400)
}
