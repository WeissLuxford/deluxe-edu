import { prisma } from '@/lib/db'

// Хард-гейт (учитель реально блокирует переход дальше) действует только для
// учеников с закреплённым куратором. В текущей схеме учитель связан со
// студентом только через Group/GroupMembership, поэтому проверка сквозная
// по всем курсам ученика, а не по конкретному курсу — Group не привязана
// к курсу.
export async function isHardGated(userId: string): Promise<boolean> {
  const membership = await prisma.groupMembership.findFirst({
    where: { userId, leftAt: null },
    select: { id: true }
  })
  return Boolean(membership)
}
