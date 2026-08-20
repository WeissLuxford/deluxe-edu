import { prisma } from './db'

// Максимум одновременно активных устройств на аккаунт. При входе с нового
// устройства сверх лимита самые давно неактивные устройства отзываются —
// их сессии перестают обновляться и разлогиниваются при следующем запросе.
export const DEVICE_LIMIT = 5

export async function registerDevice(
  userId: string,
  userAgent: string | undefined,
  ip: string | undefined
): Promise<string> {
  const ua = userAgent ?? null
  const addr = ip ?? null

  // Один и тот же IP + браузер = одно устройство. Повторный вход с него
  // не создаёт новую запись, а обновляет старую — иначе обычные
  // перезаходы одного человека раздували бы счётчик и выселяли его же
  // собственные сессии.
  const existing = await prisma.userDevice.findFirst({
    where: { userId, userAgent: ua, ip: addr },
    orderBy: { lastSeenAt: 'desc' }
  })

  const device = existing
    ? await prisma.userDevice.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date(), revokedAt: null }
      })
    : await prisma.userDevice.create({ data: { userId, userAgent: ua, ip: addr } })

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
