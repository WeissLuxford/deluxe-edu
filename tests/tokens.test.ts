import { describe, expect, it } from 'vitest'
import { isPublicToken, newPublicToken } from '@/lib/publicToken'
import { ALPHABET, normalizeSerial } from '@/features/certificates/serial'

describe('public tokens', () => {
  it('generates tokens that pass the shape check and do not repeat', () => {
    const tokens = new Set(Array.from({ length: 50 }, newPublicToken))
    expect(tokens.size).toBe(50)
    for (const t of tokens) expect(isPublicToken(t)).toBe(true)
  })

  it('rejects anything else before it reaches the database', () => {
    for (const bad of [undefined, 1, '', 'short', 'x'.repeat(42), 'x'.repeat(44), `${'x'.repeat(42)}/`]) {
      expect(isPublicToken(bad)).toBe(false)
    }
  })
})

describe('normalizeSerial', () => {
  it('accepts sloppy input and returns the canonical form', () => {
    expect(normalizeSerial(' hg-2026-abcde-fghjk ')).toBe('HG-2026-ABCDE-FGHJK')
    expect(normalizeSerial('HG 2026 ABCDE FGHJK')).toBe('HG-2026-ABCDE-FGHJK')
    expect(normalizeSerial('hg2026abcdefghjk')).toBe('HG-2026-ABCDE-FGHJK')
  })

  it('rejects ambiguous characters and wrong shapes', () => {
    expect(normalizeSerial('HG-2026-ABCDE-FGHJ0')).toBeNull()
    expect(normalizeSerial('HG-2026-ABCDI-FGHJK')).toBeNull()
    expect(normalizeSerial('XX-2026-ABCDE-FGHJK')).toBeNull()
    expect(normalizeSerial('HG-2026-ABCD')).toBeNull()
  })

  it('uses an alphabet without look-alike characters', () => {
    for (const c of 'ILOU01') expect(ALPHABET).not.toContain(c)
  })
})
