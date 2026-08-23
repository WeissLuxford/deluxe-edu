import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { FreeTrialPlayer, type TrialLesson } from '@/features/courses/components/FreeTrialPlayer'
import { localized } from '@/lib/localized'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function TrialLessonPage({ params }: Props) {
  const { locale } = await params
  const tFree = await getTranslations({ locale, namespace: 'free' })

  const course = await prisma.course.findUnique({
    where: { slug: 'trial-lesson' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { Assignment: { take: 1, select: { prompt: true } } }
      }
    }
  })

  if (!course || course.lessons.length === 0) notFound()

  const courseTitle = localized(course.title, locale)
  const lessons: TrialLesson[] = course.lessons.map(lesson => ({
    id: lesson.id,
    slug: lesson.slug,
    title: localized(lesson.title, locale),
    content: localized(lesson.content, locale),
    videoUrl: lesson.videoUrl,
    hasVideo: lesson.hasVideo,
    hasConspect: lesson.hasConspect,
    hasTest: lesson.hasTest,
    prompt: lesson.Assignment[0]?.prompt ?? null
  }))

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="level-test__head">
        <div className="page-start">
          <div className="level-test__bar">
            <Link href={`/${locale}/courses`} className="level-test__back">
              ← {tFree('backToCourses')}
            </Link>

            <div className="level-test__title">
              <span className="badge badge-success">{tFree('badge')}</span>
              <h1>{courseTitle}</h1>
            </div>

            <div className="level-test__spacer" />
          </div>
        </div>
      </header>

      <FreeTrialPlayer lessons={lessons} courseTitle={courseTitle} locale={locale} />
    </main>
  )
}
