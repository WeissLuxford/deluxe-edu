import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { normalizeEmail } from '@/features/auth/identity'
import avatarSkins from '@/content/avatars.json'

export const dynamic = 'force-dynamic'

const LOCALES = ['ru', 'uz', 'en']
const AVATAR_SKIN_IDS = new Set((avatarSkins as { id: string }[]).map(a => a.id))

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 })

  const data: Prisma.UserUpdateInput = {}

  if (typeof body.firstName === 'string') data.firstName = body.firstName.trim().slice(0, 100)
  if (typeof body.lastName === 'string') data.lastName = body.lastName.trim().slice(0, 100)
  if (typeof body.displayName === 'string') data.name = body.displayName.trim().slice(0, 100)
  if (typeof body.locale === 'string' && LOCALES.includes(body.locale)) data.locale = body.locale

  if (body.avatarSkinId === null) {
    data.avatarSkinId = null
  } else if (typeof body.avatarSkinId === 'string' && AVATAR_SKIN_IDS.has(body.avatarSkinId)) {
    data.avatarSkinId = body.avatarSkinId
  }

  let emailChanged = false
  if (typeof body.email === 'string') {
    const newEmail = normalizeEmail(body.email)
    if (newEmail) {
      data.email = newEmail
      data.emailVerified = null
      emailChanged = true
    }
  }

  try {
    await prisma.user.update({ where: { id: session.user.id }, data })
    return NextResponse.json({ ok: true, emailChanged })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'email_taken' }, { status: 409 })
    }
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
