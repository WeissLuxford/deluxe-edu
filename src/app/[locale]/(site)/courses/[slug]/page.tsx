import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { BookOpen, GraduationCap, Layers } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { LessonsList } from '@/features/courses/components/LessonsList'
import { CoursePlans } from '@/features/courses/components/CoursePlans'
import { localized } from '@/lib/localized'

type Props = {
  params: Promise<{ locale: string; slug: string }>
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
    include: {
      lessons: { orderBy: { order: 'asc' } },
      modules: { orderBy: { order: 'asc' }, select: { id: true } }
    }
  })

  if (!course) notFound()

  if (userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId: course.id, status: 'ACTIVE' },
      select: { id: true }
    })
    if (enrollment) redirect(`/${locale}/learn/${slug}`)
  }

  const total = course.lessons.length
  const title = localized(course.title, locale)
  const description = localized(course.description, locale)

  return (
    <main>
      <div>
        <nav>
          <Link href={`/${locale}/courses`}>{tCourses('title')}</Link>
          <span>/</span>
          <Link href={`/${locale}/courses?level=${encodeURIComponent(course.level)}`}>
            {course.level}
          </Link>
        </nav>

        <h1>{title}</h1>
        <p>{description}</p>

        <div>
          <span>
            <BookOpen size={15} />
            {tCourses('lessonsCount', { count: total })}
          </span>
          {course.modules.length > 0 && (
            <span>
              <Layers size={15} />
              {course.modules.length}
            </span>
          )}
          <span>
            <GraduationCap size={15} />
            {course.level}
          </span>
        </div>
      </div>

      <div>
        <CoursePlans
          courseId={course.id}
          courseSlug={course.slug}
          courseTitle={title}
          priceBasic={course.priceBasic}
          pricePro={course.pricePro}
          priceDeluxe={course.priceDeluxe}
          locale={locale}
        />

        <section>
          <h2>{t('content')}</h2>

          {total === 0 ? (
            <p>{t('noLessons')}</p>
          ) : (
            <LessonsList
              lessons={course.lessons}
              courseSlug={slug}
              locale={locale}
              progressMap={{}}
              isEnrolled={false}
            />
          )}
        </section>
      </div>
    </main>
  )
}
