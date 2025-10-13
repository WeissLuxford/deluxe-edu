import { PrismaClient } from '@prisma/client'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: { email: { label: 'email', type: 'text' }, name: { label: 'name', type: 'text' } },
      async authorize(credentials) {
        const email = String(credentials?.email || '').trim().toLowerCase()
        const name = String(credentials?.name || '').trim() || null
        if (!email) return null
        const user = await prisma.user.upsert({
          where: { email },
          update: { name },
          create: { email, name }
        })
        return { id: user.id, email: user.email, name: user.name || undefined }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id as string
      return token
    },
    async session({ session, token }) {
      if (session.user && token.userId) (session.user as any).id = token.userId
      return session
    }
  }
}

export const { handlers: authHandlers } = NextAuth(authOptions)
