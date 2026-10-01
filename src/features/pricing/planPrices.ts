import { prisma } from '@/lib/db'

// Free funnels live in the Course table too; they must not drag the
// "from" price down to their placeholder values.
export const FUNNEL_SLUGS = ['trial-lesson', 'level-test', 'free-mock-test-online']

export type PlanKey = 'BASIC' | 'PRO' | 'DELUXE'
export type PlanPrices = Record<PlanKey, number | null>

/** Cheapest price of each plan across courses people can actually buy. */
export async function startingPrices(): Promise<PlanPrices> {
  const min = await prisma.course.aggregate({
    where: { published: true, visible: true, slug: { notIn: FUNNEL_SLUGS } },
    _min: { priceBasic: true, pricePro: true, priceDeluxe: true }
  })
  return {
    BASIC: min._min.priceBasic ?? null,
    PRO: min._min.pricePro ?? null,
    DELUXE: min._min.priceDeluxe ?? null
  }
}

export function formatSum(amount: number): string {
  return new Intl.NumberFormat('ru-RU').format(amount)
}
