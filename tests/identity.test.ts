import { describe, expect, it } from 'vitest'
import { formatPhone, isValidUzPhone, normalizePhone, safeNext } from '@/features/auth/identity'

describe('normalizePhone', () => {
  it('accepts the common ways people type an Uzbek number', () => {
    expect(normalizePhone('+998 90 123 45 67')).toBe('998901234567')
    expect(normalizePhone('901234567')).toBe('998901234567')
    expect(normalizePhone('8901234567')).toBe('998901234567')
  })

  it('cuts extra digits after a full number', () => {
    expect(normalizePhone('99890123456789')).toBe('998901234567')
  })
})

describe('isValidUzPhone', () => {
  it('requires 998 and exactly nine more digits', () => {
    expect(isValidUzPhone('998901234567')).toBe(true)
    expect(isValidUzPhone('99890123456')).toBe(false)
    expect(isValidUzPhone('+998901234567')).toBe(false)
  })
})

describe('formatPhone', () => {
  it('builds the input mask progressively', () => {
    expect(formatPhone('')).toBe('+998 ')
    expect(formatPhone('90')).toBe('+998 90')
    expect(formatPhone('90123')).toBe('+998 90 123')
    expect(formatPhone('998901234567')).toBe('+998 90 123 45 67')
  })
})

describe('safeNext', () => {
  it('keeps same-site paths', () => {
    expect(safeNext('/ru/learn/a1', 'ru')).toBe('/ru/learn/a1')
  })

  it('rejects anything that could leave the site', () => {
    const bad = [
      '//evil.com',
      '/\\evil.com',
      '/\t/evil.com',
      '/\n/evil.com',
      '/ru/\\..\\evil',
      'https://evil.com',
      'evil',
      '/x?u=https://evil.com',
      42,
      ''
    ]
    for (const next of bad) {
      expect(safeNext(next, 'ru')).toBe('/ru/learn')
    }
  })
})
