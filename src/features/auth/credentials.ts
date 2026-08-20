import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { normalizePhone, normalizeEmail, isEmailIdentifier, isValidUzPhone } from './identity'
import { RATE_LIMITS, consumeRateLimit, peekRateLimit } from '@/lib/rateLimit'

export const SESSION_FIELDS = {
  id: true,
  phone: true,
  email: true,
  emailVerified: true,
  name: true,
  firstName: true,
  lastName: true,
  role: true,
  locale: true,
  image: true,
  phoneVerified: true,
  avatarSkinId: true
} as const

export type SafeUser = {
  id: string
  phone: string | null
  email: string | null
  emailVerified: Date | null
  name: string | null
  firstName: string | null
  lastName: string | null
  role: 'ADMIN' | 'MENTOR' | 'STUDENT'
  locale: string
  image: string | null
  phoneVerified: Date | null
  avatarSkinId: string | null
}

export type CredentialsResult =
  | { ok: true; user: SafeUser }
  | { ok: false; reason: 'invalid' | 'rate_limited' | 'email_unverified' }

async function findUserByIdentifier(raw: string) {
  const value = raw.trim()
  if (!value) return null

  if (isEmailIdentifier(value)) {
    return prisma.user.findUnique({
      where: { email: normalizeEmail(value) },
      select: { ...SESSION_FIELDS, passwordHash: true }
    })
  }

  const phone = normalizePhone(value)
  if (!isValidUzPhone(phone)) return null

  return prisma.user.findUnique({
    where: { phone },
    select: { ...SESSION_FIELDS, passwordHash: true }
  })
}

export async function verifyIdentifierPassword(identifier: string, password: string): Promise<CredentialsResult> {
  const id = identifier.trim()
  if (!id || !password) return { ok: false, reason: 'invalid' }

  const scope = isEmailIdentifier(id) ? normalizeEmail(id) : normalizePhone(id)

  const gate = await peekRateLimit(RATE_LIMITS.signinIdentifier, scope)
  if (!gate.allowed) return { ok: false, reason: 'rate_limited' }

  const user = await findUserByIdentifier(id)

  if (!user || !user.passwordHash) {
    await consumeRateLimit(RATE_LIMITS.signinIdentifier, scope)
    return { ok: false, reason: 'invalid' }
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    await consumeRateLimit(RATE_LIMITS.signinIdentifier, scope)
    return { ok: false, reason: 'invalid' }
  }

  if (user.email && !user.emailVerified && !user.phone) {
    return { ok: false, reason: 'email_unverified' }
  }

  const { passwordHash: _passwordHash, ...safe } = user
  return { ok: true, user: safe }
}
