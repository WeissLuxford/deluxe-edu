import { prisma } from './db'

export type RateLimitRule = {
  action: string
  limit: number
  windowMs: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfter: number
}

export const RATE_LIMITS = {
  otpPhoneBurst: { action: 'otp:phone:burst', limit: 3, windowMs: 15 * 60 * 1000 },
  otpPhoneDaily: { action: 'otp:phone:daily', limit: 8, windowMs: 24 * 60 * 60 * 1000 },
  otpIp: { action: 'otp:ip', limit: 10, windowMs: 60 * 60 * 1000 },
  otpVerify: { action: 'otp:verify', limit: 5, windowMs: 10 * 60 * 1000 },
  registerIp: { action: 'register:ip', limit: 5, windowMs: 60 * 60 * 1000 },
  signinIdentifier: { action: 'signin:identifier', limit: 10, windowMs: 15 * 60 * 1000 },
  contactIp: { action: 'contact:ip', limit: 5, windowMs: 60 * 60 * 1000 },
  forgotIdentifier: { action: 'forgot:identifier', limit: 3, windowMs: 60 * 60 * 1000 },
  resendEmail: { action: 'resend:email', limit: 3, windowMs: 60 * 60 * 1000 },
  freeTestIp: { action: 'freetest:ip', limit: 120, windowMs: 60 * 60 * 1000 },
  mobileRefreshIp: { action: 'mobile:refresh:ip', limit: 30, windowMs: 15 * 60 * 1000 }
} satisfies Record<string, RateLimitRule>

const CLEANUP_CHANCE = 0.02

export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return headers.get('x-real-ip')?.trim() || 'unknown'
}

async function cleanupExpired() {
  try {
    await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } })
  } catch {
    return
  }
}

export async function consumeRateLimit(rule: RateLimitRule, scope: string): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = Math.floor(now / rule.windowMs)
  const bucket = `${rule.action}:${scope}:${windowStart}`
  const resetAt = new Date((windowStart + 1) * rule.windowMs)

  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("id", "bucket", "count", "resetAt")
    VALUES (gen_random_uuid()::text, ${bucket}, 1, ${resetAt})
    ON CONFLICT ("bucket") DO UPDATE SET "count" = "RateLimit"."count" + 1
    RETURNING "count", "resetAt"
  `

  if (Math.random() < CLEANUP_CHANCE) void cleanupExpired()

  const count = rows[0]?.count ?? 1
  const retryAfter = Math.max(1, Math.ceil((resetAt.getTime() - now) / 1000))

  return {
    allowed: count <= rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfter
  }
}

export async function peekRateLimit(rule: RateLimitRule, scope: string): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = Math.floor(now / rule.windowMs)
  const bucket = `${rule.action}:${scope}:${windowStart}`
  const resetAt = new Date((windowStart + 1) * rule.windowMs)

  const row = await prisma.rateLimit.findUnique({ where: { bucket }, select: { count: true } })
  const count = row?.count ?? 0

  return {
    allowed: count < rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfter: Math.max(1, Math.ceil((resetAt.getTime() - now) / 1000))
  }
}

export async function consumeRateLimits(
  entries: { rule: RateLimitRule; scope: string }[]
): Promise<RateLimitResult> {
  let blocked: RateLimitResult | null = null

  for (const entry of entries) {
    const result = await consumeRateLimit(entry.rule, entry.scope)
    if (!result.allowed && (!blocked || result.retryAfter > blocked.retryAfter)) {
      blocked = result
    }
  }

  return blocked ?? { allowed: true, remaining: 0, retryAfter: 0 }
}

export function rateLimitResponse(result: RateLimitResult) {
  return Response.json(
    { error: 'rate_limited', retryAfter: result.retryAfter },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
  )
}
