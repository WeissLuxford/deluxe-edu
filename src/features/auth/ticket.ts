import { createHmac, timingSafeEqual, randomInt } from 'node:crypto'

const TICKET_TTL_MS = 15 * 60 * 1000

export type TicketPurpose = 'REGISTER' | 'BIND' | 'RESET'

export type TicketPayload = {
  challengeId: string
  phone: string
  purpose: TicketPurpose
}

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET
  if (!value) throw new Error('missing_nextauth_secret')
  return value
}

function sign(body: string): string {
  return createHmac('sha256', secret()).update(body).digest('base64url')
}

export function issueTicket(payload: TicketPayload): string {
  const expiresAt = Date.now() + TICKET_TTL_MS
  const body = [payload.challengeId, payload.phone, payload.purpose, String(expiresAt)].join('|')
  return `${Buffer.from(body).toString('base64url')}.${sign(body)}`
}

export function readTicket(ticket: unknown, purpose: TicketPurpose): TicketPayload | null {
  if (typeof ticket !== 'string') return null

  const parts = ticket.split('.')
  if (parts.length !== 2) return null

  let body: string
  try {
    body = Buffer.from(parts[0], 'base64url').toString()
  } catch {
    return null
  }

  const expected = Buffer.from(sign(body))
  const received = Buffer.from(parts[1])
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

  const [challengeId, phone, ticketPurpose, expiresAt] = body.split('|')
  if (!challengeId || !phone || !ticketPurpose || !expiresAt) return null
  if (ticketPurpose !== purpose) return null
  if (Number(expiresAt) < Date.now()) return null

  return { challengeId, phone, purpose }
}

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}
