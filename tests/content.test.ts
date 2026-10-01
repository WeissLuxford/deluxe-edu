import { describe, expect, it } from 'vitest'
import enApp from '@/locales/en/app.json'
import ruApp from '@/locales/ru/app.json'
import uzApp from '@/locales/uz/app.json'
import { campaignSlugs, getCampaign, isKnownCampaign } from '@/features/leads/campaigns'

function keys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return [prefix]
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
}

describe('locales', () => {
  const ruKeys = new Set(keys(ruApp))

  it.each([['en', enApp], ['uz', uzApp]])('%s has exactly the same keys as ru', (_, dict) => {
    const other = new Set(keys(dict))
    expect([...ruKeys].filter(k => !other.has(k)), 'missing').toEqual([])
    expect([...other].filter(k => !ruKeys.has(k)), 'extra').toEqual([])
  })
})

describe('campaigns', () => {
  it('every campaign has Russian copy for each field', () => {
    for (const slug of campaignSlugs()) {
      const c = getCampaign(slug)!
      expect(c.headline.ru, slug).toBeTruthy()
      expect(c.subhead.ru, slug).toBeTruthy()
      expect(c.offer.ru, slug).toBeTruthy()
      expect(c.bullets.ru?.length, slug).toBeGreaterThan(0)
    }
  })

  it('rejects unknown and service keys', () => {
    expect(isKnownCampaign('definitely-not-a-campaign')).toBe(false)
    expect(isKnownCampaign(undefined)).toBe(false)
    for (const slug of campaignSlugs()) expect(slug.startsWith('$')).toBe(false)
  })
})
