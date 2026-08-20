import { NextRequest, NextResponse } from 'next/server'
import { verifyIdentifierPassword } from '@/features/auth/credentials'
import { signAccessToken, generateRefreshToken } from '@/features/auth/mobileTokens'
import { registerDevice, setRefreshToken } from '@/lib/devices'
import { clientIp } from '@/lib/rateLimit'
import type { DevicePlatform } from '@prisma/client'

const PLATFORMS: DevicePlatform[] = ['IOS', 'ANDROID']

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'bad_json' }, { status: 400 })

  const identifier = String(body.identifier || '')
  const password = String(body.password || '')
  const clientDeviceId = typeof body.clientDeviceId === 'string' ? body.clientDeviceId : null
  const platform = PLATFORMS.includes(body.platform) ? (body.platform as DevicePlatform) : null

  if (!identifier || !password || !clientDeviceId || !platform) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const result = await verifyIdentifierPassword(identifier, password)
  if (result.ok === false) {
    if (result.reason === 'rate_limited') {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    if (result.reason === 'email_unverified') {
      return NextResponse.json({ error: 'email_unverified' }, { status: 403 })
    }
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
  }

  const deviceId = await registerDevice(result.user.id, req.headers.get('user-agent') ?? undefined, clientIp(req.headers), {
    platform,
    clientDeviceId
  })

  const { token: refreshToken, hash, expiresAt } = generateRefreshToken(deviceId)
  await setRefreshToken(deviceId, hash, expiresAt)

  const { token: accessToken, expiresIn } = await signAccessToken({
    sub: result.user.id,
    role: result.user.role,
    locale: result.user.locale,
    deviceId
  })

  return NextResponse.json({
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer',
    user: result.user
  })
}
