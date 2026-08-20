import { prisma } from './db'
import type { DevicePlatform } from '@prisma/client'

// Максимум одновременно активных устройств на аккаунт. При входе с нового
// устройства сверх лимита самые давно неактивные устройства отзываются —
// их сессии перестают обновляться и разлогиниваются при следующем запросе.
export const DEVICE_LIMIT = 5

export async function registerDevice(
  userId: string,
  userAgent: string | undefined,
  ip: string | undefined,
  opts: { platform?: DevicePlatform; clientDeviceId?: string } = {}
): Promise<string> {
  const ua = userAgent ?? null
  const addr = ip ?? null

  // Мобильный IP меняется на каждой сотовой сети, поэтому для мобилки
  // устройство определяется client-сгенерированным id, а не IP+UA —
  // иначе почти каждый вход с телефона считался бы новым устройством и
  // сжигал лимит.
  const existing = opts.clientDeviceId
    ? await prisma.userDevice.findUnique({
        where: { userId_clientDeviceId: { userId, clientDeviceId: opts.clientDeviceId } }
      })
    : await prisma.userDevice.findFirst({
        where: { userId, userAgent: ua, ip: addr },
        orderBy: { lastSeenAt: 'desc' }
      })

  const device = existing
    ? await prisma.userDevice.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date(), revokedAt: null, userAgent: ua, ip: addr }
      })
    : await prisma.userDevice.create({
        data: {
          userId,
          userAgent: ua,
          ip: addr,
          platform: opts.platform ?? 'WEB',
          clientDeviceId: opts.clientDeviceId
        }
      })

  const active = await prisma.userDevice.findMany({
    where: { userId, revokedAt: null },
    orderBy: { lastSeenAt: 'desc' },
    select: { id: true }
  })

  const overflow = active.slice(DEVICE_LIMIT).map(d => d.id)
  if (overflow.length > 0) {
    await prisma.userDevice.updateMany({
      where: { id: { in: overflow } },
      data: { revokedAt: new Date() }
    })
  }

  return device.id
}

export async function touchDevice(deviceId: string): Promise<boolean> {
  const device = await prisma.userDevice.findUnique({
    where: { id: deviceId },
    select: { revokedAt: true }
  })
  if (!device || device.revokedAt) return false

  await prisma.userDevice.update({ where: { id: deviceId }, data: { lastSeenAt: new Date() } })
  return true
}

export async function setRefreshToken(deviceId: string, hash: string, expiresAt: Date): Promise<void> {
  await prisma.userDevice.update({
    where: { id: deviceId },
    data: { refreshTokenHash: hash, refreshTokenExpiresAt: expiresAt, lastSeenAt: new Date() }
  })
}

// Ротация одним условным UPDATE: если предъявленный хеш не совпадает с
// текущим (токен уже прокручен, просрочен или устройство отозвано),
// обновление не пройдёт ни для одной строки. В этом случае устройство
// отзывается целиком — повторное предъявление старого refresh-токена
// не может ни на секунду продлить сессию, даже если это гонка запросов.
export async function rotateRefreshToken(
  deviceId: string,
  presentedHash: string,
  next: { hash: string; expiresAt: Date }
): Promise<boolean> {
  const updated = await prisma.userDevice.updateMany({
    where: {
      id: deviceId,
      refreshTokenHash: presentedHash,
      revokedAt: null,
      refreshTokenExpiresAt: { gt: new Date() }
    },
    data: { refreshTokenHash: next.hash, refreshTokenExpiresAt: next.expiresAt, lastSeenAt: new Date() }
  })

  if (updated.count === 0) {
    await prisma.userDevice.update({ where: { id: deviceId }, data: { revokedAt: new Date() } }).catch(() => {})
    return false
  }

  return true
}

export async function revokeDevice(deviceId: string): Promise<void> {
  await prisma.userDevice
    .update({ where: { id: deviceId }, data: { revokedAt: new Date(), refreshTokenHash: null } })
    .catch(() => {})
}
