import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CourseArticle, type CourseArticleState } from '@/features/courses/components/CourseArticle'
import { SpecialOffersSection } from '@/features/courses/components/SpecialOffersSection'

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

function localized(value: any, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value[locale]) return value[locale]
    const first = Object.values(value)[0]
    return typeof first === 'string' ? first : ''
  }
  return ''
}

export default async function CoursesPage({ params, searchParams }: Props) {
  const { locale } = await params
  const resolved = await searchParams
  const selectedLevel = resolved?.level || null

  const t = await getTranslations({ locale, namespace: 'courses' })
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null

  const courses = await prisma.course.findMany({
    where: { published: true, visible: true },
    orderBy: { createdAt: 'desc' },
    include: { lessons: { orderBy: { order: 'asc' }, select: { id: true, slug: true } } }
  })

  const hasLevelTest = courses.some(c => c.slug === 'level-test')
  const hasFreeMockTest = courses.some(c => c.slug.includes('mock-test') && c.priceBasic === 0)

  const regular = courses.filter(c => !isSpecial(c.slug) && c.lessons.length > 0)

  const progressByLesson = new Map<string, boolean>()
  const enrolledCourseIds = new Set<string>()

  if (userId) {
    const [enrollments, progress] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId, status: 'ACTIVE' },
        select: { courseId: true }
      }),
      prisma.lessonProgress.findMany({
        where: { userId },
        select: { lessonId: true, passed: true }
      })
    ])
    enrollments.forEach(e => enrolledCourseIds.add(e.courseId))
    progress.forEach(p => progressByLesson.set(p.lessonId, p.passed))
  }

  const decorate = (course: (typeof regular)[number]) => {
    const total = course.lessons.length
    const done = course.lessons.filter(l => progressByLesson.get(l.id)).length
    const enrolled = enrolledCourseIds.has(course.id)
    const completed = enrolled && total > 0 && done === total
    const resume = course.lessons.find(l => !progressByLesson.get(l.id)) ?? course.lessons[0]

    const state: CourseArticleState = !enrolled ? 'available' : completed ? 'completed' : 'enrolled'

    return {
      course,
      total,
      done,
      state,
      resumeSlug: resume?.slug
    }
  }

  const decorated = regular.map(decorate)
  const active = decorated.filter(d => d.state === 'enrolled')
  const completed = decorated.filter(d => d.state === 'completed')
  const available = decorated.filter(d => d.state === 'available')

  const levelsWithCourses = LEVELS.filter(l => available.some(d => d.course.level === l))
  const availableFiltered = selectedLevel
    ? available.filter(d => d.course.level === selectedLevel)
    : available

  const render = (d: (typeof decorated)[number]) => (
    <CourseArticle
      key={d.course.id}
      id={d.course.id}
      slug={d.course.slug}
      title={localized(d.course.title, locale) || d.course.slug}
      description={localized(d.course.description, locale)}
      level={d.course.level}
      lessonsCount={d.total}
      lessonsDone={d.done}
      priceBasic={d.course.priceBasic}
      pricePro={d.course.pricePro}
      priceDeluxe={d.course.priceDeluxe}
      locale={locale}
      state={d.state}
      resumeLessonSlug={d.resumeSlug}
    />
  )

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">{t('title')}</h1>
          <p className="page-hero__sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container page-body">
        {active.length > 0 && (
          <section className="catalog-section">
            <div className="section-head">
              <h2 className="section-title">{t('myCourses')}</h2>
              <p className="section-sub">{t('myCoursesHint')}</p>
            </div>
            <div className="course-grid">{active.map(render)}</div>
          </section>
        )}

        {completed.length > 0 && (
          <section className="catalog-section">
            <div className="section-head">
              <h2 className="section-title">{t('completedTitle')}</h2>
              <p className="section-sub">{t('completedHint')}</p>
            </div>
            <div className="course-grid">{completed.map(render)}</div>
          </section>
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

          {availableFiltered.length > 0 ? (
            <div className="course-grid">{availableFiltered.map(render)}</div>
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
