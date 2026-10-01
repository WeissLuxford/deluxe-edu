import { randomBytes } from 'node:crypto'

// Links handed to someone who never signs in: a parent opening their child's
// monthly report. The token is the entire credential, so it has to be long
// enough that guessing is hopeless and the page has to give the same answer for
// "wrong", "revoked" and "not published yet" — otherwise a probe can tell them
// apart and learn that a report exists.

const TOKEN_BYTES = 32

// 32 bytes of base64url is always 43 characters, no padding.
const TOKEN_LENGTH = 43
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/

export function newPublicToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

/**
 * Shape check before the database. A random probe costs us no query, and the
 * route can 404 on nonsense without touching Postgres.
 */
export function isPublicToken(value: unknown): value is string {
  return typeof value === 'string' && value.length === TOKEN_LENGTH && TOKEN_SHAPE.test(value)
}

/**
 * Metadata for any page reachable only by a public token. These are private
 * documents that happen to live on a public URL — they must never be indexed,
 * and referrers must not leak the token to whatever the parent clicks next.
 */
export const PRIVATE_LINK_METADATA = {
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer' as const
}
