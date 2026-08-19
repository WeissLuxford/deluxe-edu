import bcrypt from 'bcryptjs'
import type { PhoneCodePurpose } from '@prisma/client'
import { prisma } from '@/lib/db'
import { generateCode, issueTicket, readTicket } from './ticket'
import { sendOTP, isTestMode } from '@/lib/sms'

const CODE_TTL_MS = 10 * 60 * 1000

export type IssueResult = { code: string; challengeId: string }

export type VerifyError = 'invalid_code' | 'code_expired' | 'code_locked'

export type VerifyResult = {
  ok: boolean
  ticket?: string
  error?: VerifyError
}

export type ConsumeResult = {
  ok: boolean
  phone?: string
  userId?: string | null
  error?: 'invalid_ticket'
}

export async function issuePhoneCode(
  phone: string,
  purpose: PhoneCodePurpose,
  options: { userId?: string; ip?: string } = {}
): Promise<IssueResult> {
  await prisma.phoneCode.updateMany({
    where: { phone, purpose, consumedAt: null },
    data: { consumedAt: new Date() }
  })

  const code = generateCode()
  const challenge = await prisma.phoneCode.create({
    data: {
      phone,
      purpose,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
      userId: options.userId ?? null,
      ip: options.ip && options.ip !== 'unknown' ? options.ip : null
    },
    select: { id: true }
  })

  return { code, challengeId: challenge.id }
}

export async function deliverPhoneCode(phone: string, code: string): Promise<void> {
  try {
    await sendOTP(phone, code)
  } catch (error) {
    if (!isTestMode()) throw error
  }
}

export async function verifyPhoneCode(
  phone: string,
  purpose: PhoneCodePurpose,
  code: unknown
): Promise<VerifyResult> {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return { ok: false, error: 'invalid_code' }
  }

  const challenge = await prisma.phoneCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' }
  })

  if (!challenge) return { ok: false, error: 'code_expired' }

  if (challenge.expiresAt < new Date()) {
    await prisma.phoneCode.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })
    return { ok: false, error: 'code_expired' }
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    await prisma.phoneCode.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })
    return { ok: false, error: 'code_locked' }
  }

  const matches = await bcrypt.compare(code, challenge.codeHash)

  if (!matches) {
    const updated = await prisma.phoneCode.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true, maxAttempts: true }
    })

    if (updated.attempts >= updated.maxAttempts) {
      await prisma.phoneCode.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })
      return { ok: false, error: 'code_locked' }
    }

    return { ok: false, error: 'invalid_code' }
  }

  await prisma.phoneCode.update({
    where: { id: challenge.id },
    data: { verifiedAt: new Date() }
  })

  return {
    ok: true,
    ticket: issueTicket({ challengeId: challenge.id, phone, purpose })
  }
}

export async function consumeTicket(ticket: unknown, purpose: PhoneCodePurpose): Promise<ConsumeResult> {
  const payload = readTicket(ticket, purpose)
  if (!payload) return { ok: false, error: 'invalid_ticket' }

  const spent = await prisma.phoneCode.updateMany({
    where: {
      id: payload.challengeId,
      phone: payload.phone,
      purpose,
      consumedAt: null,
      verifiedAt: { not: null }
    },
    data: { consumedAt: new Date() }
  })

  if (spent.count === 0) return { ok: false, error: 'invalid_ticket' }

  const challenge = await prisma.phoneCode.findUnique({
    where: { id: payload.challengeId },
    select: { userId: true }
  })

  return { ok: true, phone: payload.phone, userId: challenge?.userId ?? null }
}
