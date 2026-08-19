import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { FreeMockTestPlayer } from '@/features/courses/components/FreeMockTestPlayer'
import { localized } from '@/lib/localized'

type Props = {
  params: Promise<{ locale: string; lesson: string }>
}

export default async function FreeMockTestLessonPage({ params }: Props) {
  const { locale, lesson: lessonSlug } = await params
  const t = await getTranslations({ locale, namespace: 'levelTest' })
  const tFree = await getTranslations({ locale, namespace: 'free' })

  const course = await prisma.course.findUnique({
    where: { slug: 'free-mock-test-online' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        // На страницу уходит только prompt: ключ ответов остаётся в базе,
        // иначе правильные ответы видно в исходнике страницы.
        include: { Assignment: { take: 1, select: { prompt: true } } }
      }
    }
  })

  if (!course) notFound()

  const index = course.lessons.findIndex(l => l.slug === lessonSlug)
  if (index === -1) notFound()

  const lesson = course.lessons[index]
  const sections = course.lessons.map(l => ({
    slug: l.slug,
    title: localized(l.title, locale)
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
              <span className="badge badge-success">{t('mockBadge')}</span>
              <h1>{sections[index].title}</h1>
              <span className="level-test__step">
                {t('sectionOf', { current: index + 1, total: sections.length })}
              </span>
            </div>

            <div className="level-test__spacer" />
          </div>

          <div className="progress" style={{ height: '4px', marginBottom: 0 }}>
            <div
              className="progress-bar"
              style={{ width: `${((index + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <FreeMockTestPlayer
        lessonSlug={lesson.slug}
        assignment={lesson.Assignment[0] ?? null}
        content={localized(lesson.content, locale)}
        sections={sections}
        currentIndex={index}
        locale={locale}
      />
    </main>
  )
}
