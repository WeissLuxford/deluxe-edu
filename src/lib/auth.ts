import { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import { z } from "zod"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import crypto from "crypto"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: "ADMIN" | "MENTOR" | "STUDENT"
      locale: string
      image?: string | null
      emailVerified?: Date | null
    }
  }
  interface User {
    id: string
    email: string
    name: string | null
    role: "ADMIN" | "MENTOR" | "STUDENT"
    locale: string
    image?: string | null
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string | null
    role: "ADMIN" | "MENTOR" | "STUDENT"
    locale: string
    image?: string | null
    emailVerified?: Date | null
  }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordSchema = z.string().regex(/^(?=.*[A-Za-z])(?=.*\d).+$/)
const signinSchema = z.object({
  action: z.literal("signin"),
  identifier: z.string().trim().min(1),
  password: passwordSchema
})
const signupSchema = z
  .object({
    action: z.literal("signup"),
    email: z.string().trim().toLowerCase().email(),
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    displayName: z.string().trim().min(1)
  })
  .refine(d => d.password === d.confirmPassword, { path: ["confirmPassword"] })

type UserWithSecret = {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "MENTOR" | "STUDENT"
  locale: string
  image: string | null
  passwordHash: string | null
  emailVerified: Date | null
}

const hasSmtp = Boolean(process.env.SMTP_HOST)
const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined
    })
  : null

async function sendVerificationEmail(to: string, token: string) {
  const base = process.env.NEXTAUTH_URL || ""
  const url = `${base}/api/verify?token=${encodeURIComponent(token)}`
  const subject = "Подтверждение почты"
  const html = `<p>Подтвердите адрес электронной почты</p><p><a href="${url}">Открыть ссылку</a></p><p>Если вы не запрашивали это письмо, игнорируйте его</p>`
  if (!transporter) {
    console.log("EMAIL VERIFICATION LINK:", url)
    return
  }
  await transporter.sendMail({ to, from: process.env.EMAIL_FROM || "no-reply@localhost", subject, html })
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        action: { label: "action", type: "text" },
        identifier: { label: "identifier", type: "text" },
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
        confirmPassword: { label: "confirmPassword", type: "password" },
        firstName: { label: "firstName", type: "text" },
        lastName: { label: "lastName", type: "text" },
        displayName: { label: "displayName", type: "text" }
      },
      authorize: async raw => {
        const action = String(raw?.action || "").trim()

        if (action === "signin") {
          const parsed = signinSchema.safeParse({
            action: "signin",
            identifier: raw?.identifier ?? raw?.email,
            password: raw?.password
          })
          if (!parsed.success) return null

          const idf = String(parsed.data.identifier || "").trim()
          const isEmail = emailRegex.test(idf)
          const email = isEmail ? idf.toLowerCase() : null

          let user: UserWithSecret | null = null

          if (email) {
            const u = await prisma.user.findUnique({
              where: { email },
              select: { id: true, email: true, name: true, role: true, locale: true, image: true, passwordHash: true, emailVerified: true }
            })
            user = (u as UserWithSecret) || null
          } else {
            const u = await prisma.user.findFirst({
              where: { name: { equals: idf, mode: "insensitive" } },
              select: { id: true, email: true, name: true, role: true, locale: true, image: true, passwordHash: true, emailVerified: true }
            })
            user = (u as UserWithSecret) || null
          }

          if (!user || !user.passwordHash) return null
          const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
          if (!ok) return null
          
          // 👈 УБРАЛ ПРОВЕРКУ: if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED")
          // Теперь можно войти даже с неподтверждённой почтой

          const out: User = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            locale: user.locale || "ru",
            image: user.image,
            emailVerified: user.emailVerified
          }
          return out
        }

        if (action === "signup") {
          const parsed = signupSchema.safeParse({
            action: "signup",
            email: raw?.email,
            password: raw?.password,
            confirmPassword: raw?.confirmPassword,
            firstName: raw?.firstName,
            lastName: raw?.lastName,
            displayName: raw?.displayName
          })
          if (!parsed.success) return null

          const exists = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } })
          if (exists) return null

          const passwordHash = await bcrypt.hash(parsed.data.password, 10)
          const created = await prisma.user.create({
            data: {
              email: parsed.data.email,
              passwordHash,
              firstName: parsed.data.firstName,
              lastName: parsed.data.lastName,
              name: parsed.data.displayName,
              role: "STUDENT",
              locale: "ru",
              emailVerified: null
            },
            select: { id: true, email: true, name: true, role: true, locale: true, image: true, emailVerified: true } // 👈 ИЗМЕНЕНО: возвращаем больше данных
          })

          const token = crypto.randomUUID()
          const expiresAt = new Date(Date.now() + 1000 * 60 * 30)
          await prisma.verificationToken.create({
            data: { token, userId: created.id, expiresAt }
          })
          
          // 👈 ИЗМЕНЕНО: отправляем письмо, но НЕ выбрасываем ошибку
          await sendVerificationEmail(created.email, token)
          
          // 👈 ДОБАВЛЕНО: возвращаем пользователя для автоматического входа
          const out: User = {
            id: created.id,
            email: created.email,
            name: created.name,
            role: created.role,
            locale: created.locale || "ru",
            image: created.image || null,
            emailVerified: created.emailVerified
          }
          return out
        }

        return null
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name ?? null
        token.role = (user as any).role
        token.locale = (user as any).locale || "ru"
        token.image = user.image ?? null
        token.emailVerified = (user as any).emailVerified ?? null
      }
      
      if (trigger === 'update' && session?.user?.emailVerified) {
        token.emailVerified = session.user.emailVerified
      }
      
      return token
    },
    session: async ({ session, token }) => {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: (token.name as string | null) ?? null,
        role: token.role as any,
        locale: (token.locale as string) || "ru",
        image: (token.image as string | null) ?? null,
        emailVerified: token.emailVerified ?? null
      }
      return session
    }
  },
  pages: {
    signIn: "/signin"
  }
}