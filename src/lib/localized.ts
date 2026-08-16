export function localized(value: unknown, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const exact = record[locale]
    if (typeof exact === 'string' && exact.trim()) return exact
    for (const candidate of Object.values(record)) {
      if (typeof candidate === 'string' && candidate.trim()) return candidate
    }
  }
  return ''
}
