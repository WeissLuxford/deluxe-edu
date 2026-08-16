// src/app/[locale]/courses/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { LessonsList } from '@/features/courses/components/LessonsList'
import { CoursePlans } from '@/features/courses/components/CoursePlans'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

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

export default async function CoursePage({ params }: Props) {
  const { locale, slug } = await params

  const [t, tCourses] = await Promise.all([
    getTranslations({ locale, namespace: 'course' }),
    getTranslations({ locale, namespace: 'courses' })
  ])

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null

  const course = await prisma.course.findUnique({
    where: { slug, published: true, visible: true },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })

  if (!course) notFound()

  const [enrollment, progress] = await Promise.all([
    userId
      ? prisma.enrollment.findFirst({
          where: { userId, courseId: course.id, status: 'ACTIVE' }
        })
      : null,
    userId
      ? prisma.lessonProgress.findMany({
          where: { userId, lessonId: { in: course.lessons.map(l => l.id) } }
        })
      : []
  ])

  const progressMap = Object.fromEntries(progress.map(p => [p.lessonId, p]))
  const total = course.lessons.length
  const done = progress.filter(p => p.passed).length
  // Курс без уроков давал деление на ноль и NaN% в полосе прогресса
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  const title = localized(course.title, locale)
  const description = localized(course.description, locale)

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href={`/${locale}/courses`}>{tCourses('title')}</Link>
            <span>/</span>
            <Link href={`/${locale}/courses?level=${encodeURIComponent(course.level)}`}>
              {course.level}
            </Link>
          </nav>

          {enrollment && (
            <span className="badge badge-primary course-hero__badge">
              {t('enrolledWith', { plan: enrollment.plan || 'BASIC' })}
            </span>
          )}

          <h1 className="page-hero__title">{title}</h1>
          <p className="page-hero__sub">{description}</p>

          <div className="course-hero__meta">
            <span>
              <BookOpen size={15} />
              {tCourses('lessonsCount', { count: total })}
            </span>
            <span>
              <GraduationCap size={15} />
              {course.level}
            </span>
            {enrollment && total > 0 && (
              <span>
                <CheckCircle2 size={15} />
                {tCourses('progressOf', { done, total })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container page-body">
        {enrollment && total > 0 && (
          <section>
            <div className="course-progress__head">
              <span>{t('progressTitle')}</span>
              <strong>{percent}%</strong>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${percent}%` }} />
            </div>
          </section>
        )}

        {!enrollment && (
          <CoursePlans
            courseId={course.id}
            courseSlug={course.slug}
            courseTitle={title}
            priceBasic={course.priceBasic}
            pricePro={course.pricePro}
            priceDeluxe={course.priceDeluxe}
            locale={locale}
          />
        )}

        <section>
          <div className="section-head">
            <h2 className="section-title">{t('content')}</h2>
          </div>

          {total === 0 ? (
            <p className="catalog-empty">{t('noLessons')}</p>
          ) : (
            <LessonsList
              lessons={course.lessons}
              courseSlug={slug}
              locale={locale}
              progressMap={progressMap}
              isEnrolled={!!enrollment}
            />
          )}
        </section>
      </div>
    </main>
  )
}
