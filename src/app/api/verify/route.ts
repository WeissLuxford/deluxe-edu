import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function back(locale: string, query: string) {
  const base = process.env.NEXTAUTH_URL || ''
  return NextResponse.redirect(`${base}/${locale}/signin?${query}`)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) return back('ru', 'verify=invalid')

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || record.purpose !== 'EMAIL_VERIFY') return back('ru', 'verify=invalid')
  if (record.usedAt) return back('ru', 'verify=used')
  if (record.expiresAt < new Date()) return back('ru', 'verify=expired')

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
    select: { locale: true }
  })

  await prisma.verificationToken.update({ where: { token }, data: { usedAt: new Date() } })

  return back(user.locale || 'ru', 'verified=1')
}
