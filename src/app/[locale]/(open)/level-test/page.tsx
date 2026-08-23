import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

type Props = {
  params: Promise<{ locale: string }>
}

function questionCount(prompt: unknown): number {
  const questions = (prompt as { questions?: unknown })?.questions
  return Array.isArray(questions) ? questions.length : 0
}

// Первая осмысленная строка конспекта — заголовки разметки в анонс не годятся.
function firstLine(content: string): string {
  return (
    content
      .split('\n')
      .map(line => line.trim())
      .find(line => line && !line.startsWith('#')) ?? ''
  )
}

export default async function LevelTestPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'levelTest' })
  const tFree = await getTranslations({ locale, namespace: 'free' })

  const course = await prisma.course.findUnique({
    where: { slug: 'level-test' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { Assignment: { take: 1, select: { prompt: true } } }
      }
    }
  })

  if (!course) notFound()

  const sections = course.lessons.map(lesson => ({
    slug: lesson.slug,
    title: localized(lesson.title, locale),
    lead: firstLine(localized(lesson.content, locale)),
    questions: questionCount(lesson.Assignment[0]?.prompt)
  }))

  const totalQuestions = sections.reduce((sum, section) => sum + section.questions, 0)
  const first = sections[0]

  return (
    <main className="page-start py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="level-intro">
          <span className="badge badge-success">{t('badge')}</span>
          <h1 className="level-intro__title">{localized(course.title, locale)}</h1>
          <p className="level-intro__lead">{localized(course.description, locale)}</p>

          <div className="level-intro__facts">
            <div>
              <strong>{totalQuestions}</strong>
              <span>{t('factQuestions')}</span>
            </div>
            <div>
              <strong>{sections.length}</strong>
              <span>{t('factSections')}</span>
            </div>
            <div>
              <strong>~15</strong>
              <span>{t('factMinutes')}</span>
            </div>
          </div>
        </div>

        <ol className="level-sections">
          {sections.map((section, index) => (
            <li key={section.slug} className="level-section">
              <span className="level-section__num">{index + 1}</span>
              <div>
                <div className="level-section__title">{section.title}</div>
                {section.lead && <p className="level-section__lead">{section.lead}</p>}
              </div>
              <span className="level-section__count">
                {t('questionsCount', { count: section.questions })}
              </span>
            </li>
          ))}
        </ol>

        <div className="level-intro__promises">
          <span>{tFree('instantResults')}</span>
          <span>{tFree('detailedReport')}</span>
          <span>{tFree('courseAdvice')}</span>
        </div>

        {first ? (
          <Link
            href={`/${locale}/level-test/${first.slug}`}
            className="btn btn-primary w-full justify-center"
          >
            {t('start')}
          </Link>
        ) : (
          <div className="test-empty">
            <h3>{t('emptyTitle')}</h3>
            <p>{t('emptyText')}</p>
          </div>
        )}

        <p className="level-intro__note">{t('noSignup')}</p>
      </div>
    </main>
  )
}
