import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { normalizeEmail } from '@/features/auth/identity'
import { SESSION_FIELDS } from '@/features/auth/credentials'
import avatarSkins from '@/content/avatars.json'

export const dynamic = 'force-dynamic'

const LOCALES = ['ru', 'uz', 'en']
const AVATAR_SKIN_IDS = new Set((avatarSkins as { id: string }[]).map(a => a.id))

export async function GET(req: Request) {
  const auth = await authenticateRequest(req)
  if (auth.ok === false) return auth.response

  const user = await prisma.user.findUnique({ where: { id: auth.principal.userId }, select: SESSION_FIELDS })
  if (!user) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  return NextResponse.json({ ok: true, user })
}

export async function PATCH(req: Request) {
  const auth = await authenticateRequest(req)
  if (auth.ok === false) return auth.response
  const userId = auth.principal.userId

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
    await prisma.user.update({ where: { id: userId }, data })
    return NextResponse.json({ ok: true, emailChanged })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'email_taken' }, { status: 409 })
    }
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
