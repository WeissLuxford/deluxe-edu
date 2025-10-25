import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  if (!token) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/ru/signin?verify=invalid`)
  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/ru/signin?verify=invalid`)
  if (record.usedAt) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/ru/signin?verify=used`)
  if (record.expiresAt < new Date()) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/ru/signin?verify=expired`)
  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() }
  })
  await prisma.verificationToken.update({
    where: { token },
    data: { usedAt: new Date() }
  })
  const locale = user.locale || "ru"
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/${locale}/signin?verified=1`)
}
