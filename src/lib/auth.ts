import { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import { z } from "zod"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phone: string
      name: string | null
      firstName: string | null
      lastName: string | null
      role: "ADMIN" | "MENTOR" | "STUDENT"
      locale: string
      image?: string | null
      phoneVerified?: Date | null
    }
  }
  interface User {
    id: string
    phone: string
    name: string | null
    firstName: string | null
    lastName: string | null
    role: "ADMIN" | "MENTOR" | "STUDENT"
    locale: string
    image?: string | null
    phoneVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    phone: string
    name: string | null
    firstName: string | null
    lastName: string | null
    role: "ADMIN" | "MENTOR" | "STUDENT"
    locale: string
    image?: string | null
    phoneVerified?: Date | null
  }
}

const passwordSchema = z.string().regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/)

const signinSchema = z.object({
  action: z.literal("signin"),
  phone: z.string().trim().min(12).max(12),
  password: passwordSchema
})

const signupSchema = z
  .object({
    action: z.literal("signup"),
    phone: z.string().trim().length(12),
    password: passwordSchema,
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1)
  })

type UserWithSecret = {
  id: string
  phone: string
  name: string | null
  firstName: string | null
  lastName: string | null
  role: "ADMIN" | "MENTOR" | "STUDENT"
  locale: string
  image: string | null
  passwordHash: string | null
  phoneVerified: Date | null
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        action: { label: "action", type: "text" },
        phone: { label: "phone", type: "text" },
        password: { label: "password", type: "password" },
        firstName: { label: "firstName", type: "text" },
        lastName: { label: "lastName", type: "text" }
      },
      authorize: async raw => {
        const action = String(raw?.action || "").trim()

        // SIGN IN
        if (action === "signin") {
          const parsed = signinSchema.safeParse({
            action: "signin",
            phone: raw?.phone,
            password: raw?.password
          })
          if (!parsed.success) {
            console.error('❌ Signin validation failed:', parsed.error)
            return null
          }

          const user = await prisma.user.findUnique({
            where: { phone: parsed.data.phone },
            select: {
              id: true,
              phone: true,
              name: true,
              firstName: true,
              lastName: true,
              role: true,
              locale: true,
              image: true,
              passwordHash: true,
              phoneVerified: true
            }
          })

          if (!user || !user.passwordHash) {
            console.error('❌ User not found or no password')
            return null
          }

          const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
          if (!ok) {
            console.error('❌ Invalid password')
            return null
          }

          console.log('✅ Sign in successful:', user.phone)

          const out: User = {
            id: user.id,
            phone: user.phone,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            locale: user.locale || "ru",
            image: user.image,
            phoneVerified: user.phoneVerified
          }
          return out
        }

        // SIGN UP
        if (action === "signup") {
          const parsed = signupSchema.safeParse({
            action: "signup",
            phone: raw?.phone,
            password: raw?.password,
            firstName: raw?.firstName,
            lastName: raw?.lastName
          })
          
          if (!parsed.success) {
            console.error('❌ Signup validation failed:', parsed.error)
            return null
          }

          const exists = await prisma.user.findUnique({
            where: { phone: parsed.data.phone },
            select: { id: true }
          })
          
          if (exists) {
            console.error('❌ Phone already registered')
            return null
          }

          const passwordHash = await bcrypt.hash(parsed.data.password, 10)
          const created = await prisma.user.create({
            data: {
              phone: parsed.data.phone,
              passwordHash,
              firstName: parsed.data.firstName,
              lastName: parsed.data.lastName,
              name: `${parsed.data.firstName} ${parsed.data.lastName}`,
              role: "STUDENT",
              locale: "ru",
              phoneVerified: new Date() // Считаем что номер уже верифицирован через OTP
            },
            select: {
              id: true,
              phone: true,
              name: true,
              firstName: true,
              lastName: true,
              role: true,
              locale: true,
              image: true,
              phoneVerified: true
            }
          })

          console.log('✅ User created:', created.phone)

          const out: User = {
            id: created.id,
            phone: created.phone,
            name: created.name,
            firstName: created.firstName,
            lastName: created.lastName,
            role: created.role,
            locale: created.locale || "ru",
            image: created.image || null,
            phoneVerified: created.phoneVerified
          }
          return out
        }

        return null
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.phone = user.phone
        token.name = user.name ?? null
        token.firstName = user.firstName ?? null
        token.lastName = user.lastName ?? null
        token.role = user.role
        token.locale = user.locale || "ru"
        token.image = user.image ?? null
        token.phoneVerified = user.phoneVerified ?? null
      }
      return token
    },
    session: async ({ session, token }) => {
      session.user = {
        id: token.id as string,
        phone: token.phone as string,
        name: (token.name as string | null) ?? null,
        firstName: (token.firstName as string | null) ?? null,
        lastName: (token.lastName as string | null) ?? null,
        role: token.role as any,
        locale: (token.locale as string) || "ru",
        image: (token.image as string | null) ?? null,
        phoneVerified: token.phoneVerified ?? null
      }
      return session
    }
  },
  pages: {
    signIn: "/signin"
  }
}