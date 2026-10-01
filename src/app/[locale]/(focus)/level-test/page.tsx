import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { LEVEL_CODES, type LevelCode } from '@/design/levels'
import { catalogCourses } from '@/features/courses/catalog'
import { LevelTestFlow, type TestSection } from '@/features/levelTest/LevelTestFlow'
import { readQuestions } from '@/features/quiz/questions'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'levelTestPage.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function LevelTestPage({ params }: Props) {
  const { locale } = await params

  const course = await prisma.course.findUnique({
    where: { slug: 'level-test' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        // Only the prompt goes to the page; the answer key stays in the database.
        include: { Assignment: { take: 1, select: { prompt: true } } }
      }
    }
  })
  if (!course) notFound()

  const sections: TestSection[] = course.lessons
    .map(lesson => ({
      slug: lesson.slug,
      title: localized(lesson.title, locale),
      content: localized(lesson.content, locale),
      questions: readQuestions(lesson.Assignment[0]?.prompt, locale)
    }))
    .filter(section => section.questions.length > 0)

  // Where to send someone after the result: the first published course of
  // their level, if there is one.
  const courses = await catalogCourses(locale, null)
  const recommended: Partial<Record<LevelCode, string>> = {}
  for (const code of LEVEL_CODES) {
    const match = courses.find(c => c.level === code)
    if (match) recommended[code] = match.slug
  }

  return <LevelTestFlow sections={sections} recommended={recommended} />
}
