// src/app/[locale]/courses/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { LessonsList } from '@/features/courses/components/LessonsList'

type Props = {
  params: Promise<{ locale: string; slug: string }>
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

export default async function CoursePage({ params }: Props) {
  const { locale, slug } = await params
  const session = await getServerSession(authOptions)
  const userPhone = session?.user?.phone || null
  const user = userPhone ? await prisma.user.findUnique({ where: { phone: userPhone } }) : null

  const course = await prisma.course.findUnique({
    where: { slug, published: true, visible: true },
    include: {
      lessons: { orderBy: { order: 'asc' } }
    }
  })

  if (!course) notFound()

  const enrollment = user
    ? await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId: course.id, status: 'ACTIVE' }
      })
    : null

  const progress = user
    ? await prisma.lessonProgress.findMany({
        where: { userId: user.id, lessonId: { in: course.lessons.map(l => l.id) } }
      })
    : []

  const progressMap = Object.fromEntries(progress.map(p => [p.lessonId, p]))

  const title = getLocalizedText(course.title, locale)
  const description = getLocalizedText(course.description, locale)

  return (
    <main className="page-start" style={{ paddingBlock: '3rem' }}>
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href={`/${locale}/courses`} style={{ color: 'var(--muted)' }}>Courses</Link>
          <span style={{ color: 'var(--muted)' }}>/</span>
          <Link href={`/${locale}/courses?level=${course.level}`} style={{ color: 'var(--muted)' }}>{course.level}</Link>
          <span style={{ color: 'var(--muted)' }}>/</span>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{title}</span>
        </div>

        {/* Hero */}
        <section className="mb-8">
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {enrollment && (
              <div className="badge badge-primary mb-4">Enrolled · {enrollment.plan || 'BASIC'}</div>
            )}
            
            <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-hero)' }}>{title}</h1>
            <p className="text-lg mb-4" style={{ color: 'var(--muted)' }}>{description}</p>
            
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted)' }}>
              <div>📚 {course.lessons.length} lessons</div>
              <div>🏆 {course.level}</div>
              {enrollment && (
                <div>
                  ✅ {progress.filter(p => p.passed).length}/{course.lessons.length} completed
                </div>
              )}
            </div>

            {!enrollment && (
              <div className="mt-6">
                <Link href={`/${locale}/courses?level=${course.level}`} className="btn btn-primary" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                  Choose Plan to Start
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Progress Bar */}
        {enrollment && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 text-sm" style={{ color: 'var(--muted)' }}>
              <span>Course Progress</span>
              <span>{Math.round((progress.filter(p => p.passed).length / course.lessons.length) * 100)}%</span>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${(progress.filter(p => p.passed).length / course.lessons.length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Lessons List */}
        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--fg)' }}>Course Content</h2>
          <LessonsList
            lessons={course.lessons}
            courseSlug={slug}
            locale={locale}
            progressMap={progressMap}
            isEnrolled={!!enrollment}
          />
        </section>
      </div>
    </main>
  )
}