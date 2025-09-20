import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Credentials({ name: 'email', credentials: { email: {}, code: {} }, async authorize() { return null } })],
  pages: { signIn: '/signin' },
  session: { strategy: 'jwt' }
})
