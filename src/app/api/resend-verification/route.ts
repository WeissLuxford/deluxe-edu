import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = String(body?.email || "").trim().toLowerCase()
  if (!email) return NextResponse.json({ ok: true })
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, emailVerified: true, locale: true } })
  if (!user || user.emailVerified) return NextResponse.json({ ok: true })
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30)
  await prisma.verificationToken.create({ data: { token, userId: user.id, expiresAt } })
  const base = process.env.NEXTAUTH_URL || ""
  const url = `${base}/api/verify?token=${encodeURIComponent(token)}`
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  })
  const subject = "Подтверждение почты"
  const html = `<p>Подтвердите адрес электронной почты</p><p><a href="${url}">Открыть ссылку</a></p><p>Если вы не запрашивали это письмо, игнорируйте его</p>`
  if (process.env.SMTP_HOST) await transporter.sendMail({ to: user.email, from: process.env.EMAIL_FROM || "no-reply@localhost", subject, html })
  return NextResponse.json({ ok: true })
}
