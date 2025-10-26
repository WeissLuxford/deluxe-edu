import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 })
    }

    const data: any = {}
    if (typeof body.firstName === 'string') data.firstName = body.firstName.trim()
    if (typeof body.lastName === 'string') data.lastName = body.lastName.trim()
    if (typeof body.displayName === 'string') data.name = body.displayName.trim()
    if (typeof body.phone === 'string') data.phone = body.phone.trim()
    if (typeof body.locale === 'string') data.locale = body.locale

    let emailChanged = false
    if (typeof body.email === 'string') {
      const newEmail = body.email.trim().toLowerCase()
      if (newEmail) {
        data.email = newEmail
        data.emailVerified = null
        emailChanged = true
      }
    }

    await prisma.user.update({ where: { id: session.user.id }, data })
    return NextResponse.json({ ok: true, emailChanged })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'email_taken' }, { status: 409 })
    }
    console.error(e)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
