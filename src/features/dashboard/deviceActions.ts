'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function revokeOwnDevice(deviceId: string, locale: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false, error: 'unauthorized' }

  const device = await prisma.userDevice.findUnique({ where: { id: deviceId }, select: { userId: true } })
  if (!device || device.userId !== session.user.id) return { ok: false, error: 'not_found' }

  await prisma.userDevice.update({ where: { id: deviceId }, data: { revokedAt: new Date() } })

  revalidatePath(`/${locale}/learn/account`)
  return { ok: true }
}
