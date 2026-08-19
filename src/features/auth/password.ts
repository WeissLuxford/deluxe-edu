import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'

export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/

export const passwordSchema = z.string().regex(PASSWORD_PATTERN)

export function isStrongEnough(value: string): boolean {
  return PASSWORD_PATTERN.test(value)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function applyNewPassword(userId: string, password: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      passwordChangedAt: new Date()
    }
  })
}
