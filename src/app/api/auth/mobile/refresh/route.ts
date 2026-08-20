import { NextRequest, NextResponse } from 'next/server'
import { parseRefreshToken, generateRefreshToken, signAccessToken } from '@/features/auth/mobileTokens'
import { rotateRefreshToken } from '@/lib/devices'
import { RATE_LIMITS, consumeRateLimit, clientIp } from '@/lib/rateLimit'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const gate = await consumeRateLimit(RATE_LIMITS.mobileRefreshIp, clientIp(req.headers))
  if (!gate.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(gate.retryAfter) } })
  }

  const body = await req.json().catch(() => null)
  const refreshToken = typeof body?.refreshToken === 'string' ? body.refreshToken : null
  if (!refreshToken) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const parsed = parseRefreshToken(refreshToken)
  if (!parsed) return NextResponse.json({ error: 'refresh_invalid' }, { status: 401 })

  const next = generateRefreshToken(parsed.deviceId)
  const rotated = await rotateRefreshToken(parsed.deviceId, parsed.hash, { hash: next.hash, expiresAt: next.expiresAt })
  if (!rotated) return NextResponse.json({ error: 'refresh_invalid' }, { status: 401 })

  const device = await prisma.userDevice.findUnique({
    where: { id: parsed.deviceId },
    select: { user: { select: { id: true, role: true, locale: true } } }
  })
  if (!device) return NextResponse.json({ error: 'refresh_invalid' }, { status: 401 })

  const { token: accessToken, expiresIn } = await signAccessToken({
    sub: device.user.id,
    role: device.user.role,
    locale: device.user.locale,
    deviceId: parsed.deviceId
  })

  return NextResponse.json({ accessToken, refreshToken: next.token, expiresIn, tokenType: 'Bearer' })
}
