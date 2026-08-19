export const UZ_PHONE_DIGITS = 12
export const PHONE_PREFIX = '+998 '

export function digitsOf(value: string): string {
  return value.replace(/\D/g, '')
}

export function normalizePhone(value: string): string {
  const digits = digitsOf(value)
  if (digits.startsWith('998')) return digits.slice(0, UZ_PHONE_DIGITS)
  if (digits.startsWith('8') && digits.length === 10) return `998${digits.slice(1)}`
  if (digits.length === 9) return `998${digits}`
  return digits
}

export function isValidUzPhone(value: string): boolean {
  return /^998\d{9}$/.test(value)
}

export function formatPhone(value: string): string {
  let digits = digitsOf(value)

  if (digits.startsWith('998')) {
    digits = digits.slice(3, UZ_PHONE_DIGITS)
  } else if (digits.length > 0) {
    digits = digits.slice(0, 9)
  }

  if (digits.length === 0) return PHONE_PREFIX
  if (digits.length <= 2) return `${PHONE_PREFIX}${digits}`
  if (digits.length <= 5) return `${PHONE_PREFIX}${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 7) return `${PHONE_PREFIX}${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  return `${PHONE_PREFIX}${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isEmailIdentifier(value: string): boolean {
  return value.includes('@')
}

export function safeNext(next: unknown, locale: string, fallback = 'learn'): string {
  const home = `/${locale}/${fallback}`
  if (typeof next !== 'string' || next.length === 0) return home
  if (!next.startsWith('/')) return home
  if (next.startsWith('//') || next.startsWith('/\\')) return home
  if (next.includes('://')) return home
  return next
}
