// Временный: смотрим, какие учётки уже есть, чтобы тест не упёрся в email_taken.
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const users = await prisma.user.findMany({
  select: { id: true, email: true, phone: true, role: true, emailVerified: true, phoneVerified: true, createdAt: true },
  orderBy: { createdAt: 'desc' },
  take: 25
})

console.log(`всего пользователей: ${await prisma.user.count()}`)
for (const u of users) {
  const ev = u.emailVerified ? 'email✓' : u.email ? 'email✗' : '—'
  const pv = u.phoneVerified ? 'phone✓' : u.phone ? 'phone✗' : '—'
  console.log(`${u.createdAt.toISOString().slice(0, 16)} | ${u.role.padEnd(7)} | ${(u.email ?? '—').padEnd(32)} | ${(u.phone ?? '—').padEnd(13)} | ${ev} ${pv}`)
}

await prisma.$disconnect()
