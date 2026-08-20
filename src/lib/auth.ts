import { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { headers } from 'next/headers'
import { prisma } from './db'
import { resolveGoogleUser, type GoogleProfile } from '@/features/auth/google'
import { SESSION_FIELDS, verifyIdentifierPassword } from '@/features/auth/credentials'
import { clientIp } from './rateLimit'
import { registerDevice, touchDevice } from './devices'

type Role = 'ADMIN' | 'MENTOR' | 'STUDENT'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      phone: string | null
      email: string | null
      emailVerified: Date | null
      name: string | null
      firstName: string | null
      lastName: string | null
      role: Role
      locale: string
      image?: string | null
      phoneVerified?: Date | null
      avatarSkinId?: string | null
      deviceId?: string | null
    }
  }
  interface User {
    id: string
    phone: string | null
    email: string | null
    emailVerified: Date | null
    name: string | null
    firstName: string | null
    lastName: string | null
    role: Role
    locale: string
    image?: string | null
    phoneVerified?: Date | null
    avatarSkinId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    phone: string | null
    email: string | null
    emailVerified: Date | null
    name: string | null
    firstName: string | null
    lastName: string | null
    role: Role
    locale: string
    image?: string | null
    phoneVerified?: Date | null
    avatarSkinId?: string | null
    refreshedAt?: number
    invalid?: boolean
    deviceId?: string
  }
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

async function assignDevice(userId: string): Promise<string> {
  const h = await headers()
  return registerDevice(userId, h.get('user-agent') ?? undefined, clientIp(h))
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: false
          })
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'identifier', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      authorize: async raw => {
        const identifier = String(raw?.identifier || '').trim()
        const password = String(raw?.password || '')

        if (!identifier || !password) return null

        const result = await verifyIdentifierPassword(identifier, password)
        if (result.ok === false) {
          if (result.reason === 'invalid') return null
          throw new Error(result.reason)
        }
        return result.user as NextAuthUser
      }
    })
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      if (account?.provider !== 'google') return true

      const outcome = await resolveGoogleUser(profile as GoogleProfile, 'ru')

      if (!outcome.ok || !outcome.userId) {
        return `/signin?error=${outcome.error ?? 'server'}`
      }

      user.id = outcome.userId
      return true
    },
    jwt: async ({ token, user, account, trigger }) => {
      if (user && account?.provider === 'google') {
        const fresh = await prisma.user.findUnique({
          where: { id: user.id },
          select: SESSION_FIELDS
        })

        if (!fresh) {
          token.invalid = true
          return token
        }

        token.id = fresh.id
        token.phone = fresh.phone
        token.email = fresh.email
        token.emailVerified = fresh.emailVerified
        token.name = fresh.name
        token.firstName = fresh.firstName
        token.lastName = fresh.lastName
        token.role = fresh.role
        token.locale = fresh.locale || 'ru'
        token.image = fresh.image
        token.phoneVerified = fresh.phoneVerified
        token.avatarSkinId = fresh.avatarSkinId
        token.refreshedAt = Date.now()
        token.deviceId = await assignDevice(fresh.id)
        return token
      }

      if (user) {
        token.id = user.id
        token.phone = user.phone ?? null
        token.email = user.email ?? null
        token.emailVerified = user.emailVerified ?? null
        token.name = user.name ?? null
        token.firstName = user.firstName ?? null
        token.lastName = user.lastName ?? null
        token.role = user.role
        token.locale = user.locale || 'ru'
        token.image = user.image ?? null
        token.phoneVerified = user.phoneVerified ?? null
        token.avatarSkinId = user.avatarSkinId ?? null
        token.refreshedAt = Date.now()
        token.deviceId = await assignDevice(user.id)
        return token
      }

      const stale = !token.refreshedAt || Date.now() - token.refreshedAt > REFRESH_INTERVAL_MS

      if (trigger === 'update' || stale) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { ...SESSION_FIELDS, passwordChangedAt: true }
        })

        if (!fresh) {
          token.invalid = true
          return token
        }

        const issuedAt = Number(token.iat ?? 0) * 1000
        if (fresh.passwordChangedAt && issuedAt && fresh.passwordChangedAt.getTime() > issuedAt) {
          token.invalid = true
          return token
        }

        if (token.deviceId && !(await touchDevice(token.deviceId))) {
          token.invalid = true
          return token
        }

        token.phone = fresh.phone
        token.email = fresh.email
        token.emailVerified = fresh.emailVerified
        token.name = fresh.name
        token.firstName = fresh.firstName
        token.lastName = fresh.lastName
        token.role = fresh.role
        token.locale = fresh.locale || 'ru'
        token.image = fresh.image
        token.phoneVerified = fresh.phoneVerified
        token.avatarSkinId = fresh.avatarSkinId
        token.refreshedAt = Date.now()
      }

      return token
    },
    session: async ({ session, token }) => {
      if (token.invalid) {
        session.user = {
          id: '',
          phone: null,
          email: null,
          emailVerified: null,
          name: null,
          firstName: null,
          lastName: null,
          role: 'STUDENT',
          locale: 'ru',
          image: null,
          phoneVerified: null,
          avatarSkinId: null,
          deviceId: null
        }
        return session
      }

      session.user = {
        id: token.id as string,
        phone: (token.phone as string | null) ?? null,
        email: (token.email as string | null) ?? null,
        emailVerified: (token.emailVerified as Date | null) ?? null,
        name: (token.name as string | null) ?? null,
        firstName: (token.firstName as string | null) ?? null,
        lastName: (token.lastName as string | null) ?? null,
        role: token.role as Role,
        locale: (token.locale as string) || 'ru',
        image: (token.image as string | null) ?? null,
        phoneVerified: (token.phoneVerified as Date | null) ?? null,
        avatarSkinId: (token.avatarSkinId as string | null) ?? null,
        deviceId: (token.deviceId as string | undefined) ?? null
      }

      return session
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith('/') && !url.startsWith('//')) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {
        return baseUrl
      }
      return baseUrl
    }
  },
  pages: {
    signIn: '/signin'
  }
}
