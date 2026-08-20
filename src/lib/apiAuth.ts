import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { verifyAccessToken, type MobileRole } from '@/features/auth/mobileTokens'

export type ApiPrincipal = {
  userId: string
  role: MobileRole
  locale: string
  deviceId: string | null
  via: 'cookie' | 'bearer'
}

export type ApiAuthResult = { ok: true; principal: ApiPrincipal } | { ok: false; response: NextResponse }

function unauthorized(): ApiAuthResult {
  return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
}

// Принимает либо Bearer-токен мобильного приложения, либо веб-cookie
// сессию NextAuth — так существующие роуты получают поддержку мобилки,
// меняя одну строку, без дублирования проверки под каждую платформу.
//
// Bearer-ветка не ходит в БД: access-токен проверяется только по подписи
// и сроку жизни (15 мин). Ревокация устройства/смена пароля применяются
// на следующем refresh, а не мгновенно — тот же компромисс уже принят
// для веб-сессии (см. REFRESH_INTERVAL_MS в src/lib/auth.ts).
export async function authenticateRequest(req: Request): Promise<ApiAuthResult> {
  const header = req.headers.get('authorization')

  if (header?.startsWith('Bearer ')) {
    const claims = await verifyAccessToken(header.slice(7))
    if (!claims) return unauthorized()

    return {
      ok: true,
      principal: { userId: claims.sub, role: claims.role, locale: claims.locale, deviceId: claims.deviceId, via: 'bearer' }
    }
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return unauthorized()

  return {
    ok: true,
    principal: {
      userId: session.user.id,
      role: session.user.role,
      locale: session.user.locale,
      deviceId: session.user.deviceId ?? null,
      via: 'cookie'
    }
  }
}
