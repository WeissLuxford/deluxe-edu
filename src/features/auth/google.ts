import { prisma } from '@/lib/db'
import { normalizeEmail } from './identity'

const PROVIDER = 'google'

export type GoogleProfile = {
  sub?: string
  email?: string
  email_verified?: boolean
  given_name?: string
  family_name?: string
  name?: string
  picture?: string
}

export type LinkError = 'google_unverified' | 'link_required'

export type LinkOutcome = {
  ok: boolean
  userId?: string
  error?: LinkError
}

export async function resolveGoogleUser(profile: GoogleProfile, locale: string): Promise<LinkOutcome> {
  if (profile.email_verified !== true || !profile.email || !profile.sub) {
    return { ok: false, error: 'google_unverified' }
  }

  const email = normalizeEmail(profile.email)

  const linked = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: PROVIDER, providerAccountId: profile.sub } },
    select: { userId: true }
  })

  if (linked) return { ok: true, userId: linked.userId }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true, passwordHash: true }
  })

  if (!existing) {
    const created = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          email,
          emailVerified: new Date(),
          firstName: profile.given_name ?? null,
          lastName: profile.family_name ?? null,
          name: profile.name ?? null,
          image: profile.picture ?? null,
          role: 'STUDENT',
          locale
        },
        select: { id: true }
      })

      await tx.oAuthAccount.create({
        data: { userId: user.id, provider: PROVIDER, providerAccountId: profile.sub as string }
      })

      return user
    })

    return { ok: true, userId: created.id }
  }

  if (!existing.emailVerified && existing.passwordHash) {
    return { ok: false, error: 'link_required' }
  }

  await prisma.$transaction(async tx => {
    await tx.oAuthAccount.create({
      data: { userId: existing.id, provider: PROVIDER, providerAccountId: profile.sub as string }
    })

    if (!existing.emailVerified) {
      await tx.user.update({ where: { id: existing.id }, data: { emailVerified: new Date() } })
    }
  })

  return { ok: true, userId: existing.id }
}
