'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import type { ActionResult } from './actions'

export async function revokeDevice(id: string): Promise<ActionResult> {
  await requireAdmin()

  const device = await prisma.userDevice.update({
    where: { id },
    data: { revokedAt: new Date() },
    select: { userId: true }
  })

  revalidatePath(`/ru/admin/students/${device.userId}`)
  return { ok: true }
}
