import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CourseArticle } from '@/features/courses/components/CourseArticle'
import { SpecialOffersSection } from '@/features/courses/components/SpecialOffersSection'
import { getEnrolledCourseIds } from '@/features/learn/progress'
import { localized } from '@/lib/localized'
import { resolvePublicAsset } from '@/lib/publicAsset'

type Props = {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ level?: string }>
}

const LEVELS = [
  'Beginner',
  'Elementary',
  'Pre-Intermediate',
  'Intermediate',
  'Upper-Intermediate',
  'Advanced'
]

const SPECIAL_SLUGS = ['level-test', 'trial-lesson']
const isSpecial = (slug: string) => SPECIAL_SLUGS.includes(slug) || slug.includes('mock-test')

export default async function CoursesPage({ params, searchParams }: Props) {
  const { locale } = await params
  const resolved = await searchParams
  const selectedLevel = resolved?.level || null

  const [t, tLearn] = await Promise.all([
    getTranslations({ locale, namespace: 'courses' }),
    getTranslations({ locale, namespace: 'learn' })
  ])

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null

  const courses = await prisma.course.findMany({
    where: { published: true, visible: true },
    orderBy: { createdAt: 'desc' },
    include: {
      lessons: { orderBy: { order: 'asc' }, select: { id: true, durationMin: true } }
    }
  })

  const hasLevelTest = courses.some(c => c.slug === 'level-test')
  const hasFreeMockTest = courses.some(c => c.slug.includes('mock-test') && c.priceBasic === 0)

  const enrolledIds = userId ? await getEnrolledCourseIds(userId) : new Set<string>()

  const catalogue = courses.filter(
    c => !isSpecial(c.slug) && c.lessons.length > 0 && !enrolledIds.has(c.id)
  )

  const levelsWithCourses = LEVELS.filter(l => catalogue.some(c => c.level === l))
  const filtered = selectedLevel ? catalogue.filter(c => c.level === selectedLevel) : catalogue

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">{t('title')}</h1>
          <p className="page-hero__sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container page-body">
        {enrolledIds.size > 0 && (
          <Link href={`/${locale}/learn`} className="learn-strip">
            <GraduationCap size={18} />
            <span>
              {t('myCourses')}: {enrolledIds.size}
            </span>
            <strong>
              {tLearn('resumeAction')}
              <ArrowRight size={15} />
            </strong>
          </Link>
        )}

        <section className="catalog-section">
          <div className="section-head">
            <h2 className="section-title">{t('available')}</h2>
            <p className="section-sub">{t('availableHint')}</p>
          </div>

          {levelsWithCourses.length > 1 && (
            <div className="level-filter">
              <Link
                href={`/${locale}/courses`}
                className={`level-chip${!selectedLevel ? ' active' : ''}`}
              >
                {t('allLevels')}
              </Link>
              {levelsWithCourses.map(l => (
                <Link
                  key={l}
                  href={`/${locale}/courses?level=${encodeURIComponent(l)}`}
                  className={`level-chip${selectedLevel === l ? ' active' : ''}`}
                >
                  {l}
                </Link>
              ))}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="course-grid">
              {filtered.map(course => (
                <CourseArticle
                  key={course.id}
                  id={course.id}
                  slug={course.slug}
                  title={localized(course.title, locale) || course.slug}
                  description={localized(course.description, locale)}
                  level={course.level}
                  lessonsCount={course.lessons.length}
                  totalMinutes={course.lessons.reduce((sum, l) => sum + (l.durationMin ?? 0), 0)}
                  coverUrl={resolvePublicAsset(course.coverUrl)}
                  badge={course.badge}
                  priceBasic={course.priceBasic}
                  pricePro={course.pricePro}
                  priceDeluxe={course.priceDeluxe}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p className="catalog-empty">{selectedLevel ? t('emptyLevel') : t('empty')}</p>
          )}
        </section>

        <SpecialOffersSection
          hasLevelTest={hasLevelTest}
          hasFreeMockTest={hasFreeMockTest}
          locale={locale}
        />
      </div>
    </main>
  )
}
