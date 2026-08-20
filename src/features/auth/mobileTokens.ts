import { SignJWT, jwtVerify } from 'jose'
import { createHmac, randomBytes } from 'node:crypto'

export type MobileRole = 'ADMIN' | 'MENTOR' | 'STUDENT'

export type AccessTokenClaims = {
  sub: string
  role: MobileRole
  locale: string
  deviceId: string
}

const ACCESS_TOKEN_TTL_SEC = 15 * 60
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

function secret(): Uint8Array {
  const value = process.env.MOBILE_AUTH_SECRET
  if (!value) throw new Error('missing_mobile_auth_secret')
  return new TextEncoder().encode(value)
}

export async function signAccessToken(claims: AccessTokenClaims): Promise<{ token: string; expiresIn: number }> {
  const token = await new SignJWT({ role: claims.role, locale: claims.locale, deviceId: claims.deviceId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SEC}s`)
    .sign(secret())

  return { token, expiresIn: ACCESS_TOKEN_TTL_SEC }
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    if (!payload.sub || typeof payload.role !== 'string' || typeof payload.deviceId !== 'string') return null

    return {
      sub: payload.sub,
      role: payload.role as MobileRole,
      locale: typeof payload.locale === 'string' ? payload.locale : 'ru',
      deviceId: payload.deviceId
    }
  } catch {
    return null
  }
}

function hashRefreshToken(raw: string): string {
  return createHmac('sha256', process.env.MOBILE_AUTH_SECRET ?? '').update(raw).digest('base64url')
}

export function generateRefreshToken(deviceId: string): { token: string; hash: string; expiresAt: Date } {
  const raw = randomBytes(32).toString('base64url')
  const token = `${deviceId}.${raw}`
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)

  return { token, hash: hashRefreshToken(raw), expiresAt }
}

export function parseRefreshToken(token: string): { deviceId: string; hash: string } | null {
  const dot = token.indexOf('.')
  if (dot <= 0 || dot === token.length - 1) return null

  const deviceId = token.slice(0, dot)
  const raw = token.slice(dot + 1)
  return { deviceId, hash: hashRefreshToken(raw) }
}
