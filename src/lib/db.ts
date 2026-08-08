import { PrismaClient } from '@prisma/client'

// Единственный экземпляр Prisma на всё приложение.
// В dev Next.js перезагружает модули на каждое изменение — без globalThis
// на каждый reload создавался бы новый клиент и утекали соединения с базой.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // В проде логировать каждый SQL-запрос не нужно: это шум и утечка данных в логи
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
