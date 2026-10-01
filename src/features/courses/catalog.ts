import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { levelCode, type LevelCode } from '@/design/levels'
import { getEnrolledCourseIds } from '@/features/learn/progress'
import { FUNNEL_SLUGS } from '@/features/pricing/planPrices'

export type Topic = 'grammar' | 'speaking' | 'exams' | 'work' | 'writing' | 'general'
export const TOPICS: Topic[] = ['grammar', 'speaking', 'exams', 'work', 'writing']

// Course has no topic column yet (adding one needs a dev database first, see
// docs/PROGRESS.md). Until then the topic is read from the slug, which admins
// already name by topic: "intermediate-grammar", "advanced-academic-writing".
export function topicOf(slug: string): Topic {
  if (/grammar/.test(slug)) return 'grammar'
  if (/speaking/.test(slug)) return 'speaking'
  if (/mock-test|ielts|toefl/.test(slug)) return 'exams'
  if (/business|professional/.test(slug)) return 'work'
  if (/writing/.test(slug)) return 'writing'
  return 'general'
}

export type CatalogCourse = {
  id: string
  slug: string
  title: string
  description: string
  level: LevelCode
  topic: Topic
  lessons: number
  fromPrice: number
}

/** Courses a visitor can buy: published, visible, with lessons, not a free funnel, not already theirs. */
export async function catalogCourses(locale: string, userId: string | null): Promise<CatalogCourse[]> {
  const [courses, enrolled] = await Promise.all([
    prisma.course.findMany({
      where: { published: true, visible: true, slug: { notIn: FUNNEL_SLUGS } },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        level: true,
        priceBasic: true,
        _count: { select: { lessons: true } }
      }
    }),
    userId ? getEnrolledCourseIds(userId) : Promise.resolve(new Set<string>())
  ])

  return courses
    .filter(c => c._count.lessons > 0 && !enrolled.has(c.id))
    .map(c => ({
      id: c.id,
      slug: c.slug,
      title: localized(c.title, locale) || c.slug,
      description: localized(c.description, locale),
      level: levelCode(c.level),
      topic: topicOf(c.slug),
      lessons: c._count.lessons,
      fromPrice: c.priceBasic
    }))
    .sort((a, b) => a.level.localeCompare(b.level))
}
