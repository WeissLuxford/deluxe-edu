// src/app/[locale]/courses/page.tsx
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CourseCard } from '@/features/courses/components/CourseCard'
import { SpecialOffersSection } from '@/features/courses/components/SpecialOffersSection'

type Props = {
  params: { locale: string }
  searchParams?: { level?: string }
}

function getLocalizedText(value: any, locale: string) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value[locale]) return value[locale]
    const first = Object.values(value)[0]
    return typeof first === 'string' ? first : ''
  }
  return ''
}

const LEVELS = ['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced']

export default async function CoursesPage({ params, searchParams }: Props) {
  const locale = params.locale
  const selectedLevel = searchParams?.level || null
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email || null
  const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null

  const courses = await prisma.course.findMany({
    where: { published: true, visible: true },
    orderBy: { createdAt: 'desc' },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })

  // Фильтруем специальные курсы
  const regularCourses = courses.filter(c => 
    c.slug !== 'level-test' && 
    c.slug !== 'trial-lesson' && 
    !c.slug.includes('mock-test')
  )
  
  const trialLesson = courses.find(c => c.slug === 'trial-lesson')
  const levelTestCourse = courses.find(c => c.slug === 'level-test')
  const freeMockTest = courses.find(c => c.slug.includes('mock-test') && c.priceBasic === 0)
  const paidMockTest = courses.find(c => c.slug.includes('mock-test') && c.priceBasic > 0)

  const grouped: Record<string, typeof regularCourses> = {}
  for (const c of regularCourses) {
    const lvl = c.level || 'Other'
    if (!grouped[lvl]) grouped[lvl] = []
    grouped[lvl].push(c)
  }

  const displayLevels = [...LEVELS, 'Other'].filter((l) => grouped[l] && grouped[l].length > 0)

  let enrollmentMap: Record<string, any> = {}
  if (user) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { course: true }
    })
    enrollmentMap = Object.fromEntries(enrollments.map((e) => [e.courseId, e]))
  }

  if (!selectedLevel) {
    return (
      <main className="page-start" style={{ paddingBlock: '3rem' }}>
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 text-center">
            <h1 className="hero-title" style={{ color: 'var(--text-hero)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1rem' }}>Choose Your Level</h1>
            <p className="herotxt" style={{ color: 'var(--muted)', fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>Select your English proficiency level</p>
          </header>

          {/* Special Offers - 4 блока */}
          <SpecialOffersSection
            levelTestCourse={levelTestCourse}
            freeMockTest={freeMockTest}
            paidMockTest={paidMockTest}
            locale={locale}
          />

          {/* Level Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mt-12">
            {displayLevels.map((lvl) => {
              const count = (grouped[lvl] || []).length
              return (
                <Link key={lvl} href={`/${locale}/courses?level=${encodeURIComponent(lvl)}`} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', transition: 'var(--transition-slow)', cursor: 'pointer' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--gold)', marginBottom: '0.75rem' }}>{lvl.charAt(0)}</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--fg)', marginBottom: '0.25rem' }}>{lvl}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{count} course{count !== 1 ? 's' : ''}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    )
  }

  const coursesForLevel = grouped[selectedLevel] || []

  return (
    <main className="page-start" style={{ paddingBlock: '3rem' }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href={`/${locale}/courses`} style={{ color: 'var(--muted)' }}>Courses</Link>
          <span style={{ color: 'var(--muted)' }}>/</span>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{selectedLevel}</span>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-hero)' }}>{selectedLevel}</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>{coursesForLevel.length} course{coursesForLevel.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href={`/${locale}/courses`} className="btn btn-secondary">← Change level</Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coursesForLevel.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              slug={course.slug}
              title={getLocalizedText(course.title, locale) || course.slug}
              description={getLocalizedText(course.description, locale) || ''}
              priceBasic={course.priceBasic}
              pricePro={course.pricePro}
              priceDeluxe={course.priceDeluxe}
              lessonsCount={course.lessons.length}
              locale={locale}
              isEnrolled={!!enrollmentMap[course.id]}
              firstLessonSlug={course.lessons?.[0]?.slug}
            />
          ))}
        </div>

        <section className="mt-12 cta-glass">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--fg)' }}>All plans include</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Trial Lesson', items: ['First lesson free', 'Video content', 'Basic assignments'] },
              { name: 'Basic', items: ['All video lessons', 'Auto-graded tests', 'Certificate'] },
              { name: 'Pro', items: ['Everything in Basic', 'Mentor feedback', 'Priority support'] },
              { name: 'Deluxe', items: ['Everything in Pro', '1-on-1 mentoring', 'Career guidance'] }
            ].map((plan) => (
              <div key={plan.name} className="glass-panel">
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--gold)' }}>{plan.name}</div>
                <ul className="space-y-1 text-sm" style={{ color: 'var(--muted)' }}>
                  {plan.items.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}