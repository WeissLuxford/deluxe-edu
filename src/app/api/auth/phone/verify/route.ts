import { NextRequest, NextResponse } from 'next/server'
import { normalizePhone, isValidUzPhone } from '@/features/auth/identity'
import { verifyPhoneCode } from '@/features/auth/phoneCode'

export const dynamic = 'force-dynamic'

const PURPOSES = ['REGISTER', 'BIND', 'RESET'] as const
type Purpose = (typeof PURPOSES)[number]

const STATUS: Record<string, number> = {
  invalid_code: 400,
  code_expired: 400,
  code_locked: 429
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  const phone = normalizePhone(String((body as any)?.phone ?? ''))
  const purpose = String((body as any)?.purpose ?? '') as Purpose

  if (!isValidUzPhone(phone) || !PURPOSES.includes(purpose)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const result = await verifyPhoneCode(phone, purpose, (body as any)?.code)

  if (!result.ok) {
    const error = result.error ?? 'invalid_code'
    return NextResponse.json({ error }, { status: STATUS[error] ?? 400 })
  }

  return NextResponse.json({ ok: true, ticket: result.ticket })
}
