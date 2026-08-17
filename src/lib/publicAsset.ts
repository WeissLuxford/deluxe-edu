import { existsSync } from 'node:fs'
import { join } from 'node:path'

const cache = new Map<string, boolean>()

export function resolvePublicAsset(url: string | null | undefined): string | null {
  const value = url?.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  if (!value.startsWith('/')) return null

  const useCache = process.env.NODE_ENV === 'production'
  if (useCache) {
    const cached = cache.get(value)
    if (cached !== undefined) return cached ? value : null
  }

  const clean = value.split('?')[0].split('#')[0]
  const exists = existsSync(join(process.cwd(), 'public', clean))
  if (useCache) cache.set(value, exists)

  return exists ? value : null
}
