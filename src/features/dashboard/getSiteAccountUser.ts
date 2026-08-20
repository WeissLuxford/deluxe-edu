import { prisma } from '@/lib/db'

export async function getSiteAccountUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      avatarSkinId: true,
      role: true,
      locale: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      phone: true,
      emailVerified: true,
      phoneVerified: true
    }
  })
}
