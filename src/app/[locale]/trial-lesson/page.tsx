// src/app/[locale]/trial-lesson/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { FreeTrialPlayer } from '@/features/courses/components/FreeTrialPlayer'

type Props = {
  params: Promise<{ locale: string }>
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

export default async function TrialLessonPage({ params }: Props) {
  const { locale } = await params

  const course = await prisma.course.findUnique({
    where: { slug: 'trial-lesson' },
    include: {
      lessons: { orderBy: { order: 'asc' } }
    }
  })

  if (!course || course.lessons.length === 0) notFound()

  const lesson = course.lessons[0]
  const title = getLocalizedText(lesson.title, locale)
  const content = getLocalizedText(lesson.content, locale)
  const courseTitle = getLocalizedText(course.title, locale)

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="page-start">
          <div className="flex items-center justify-between py-4">
            <Link href={`/${locale}/courses`} className="text-sm" style={{ color: 'var(--muted)' }}>
              ← Back to courses
            </Link>

            <div className="text-center flex-1">
              <div className="badge badge-success mb-1">FREE TRIAL</div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{title}</h1>
            </div>

            <div className="w-32" />
          </div>
        </div>
      </header>

      {/* Content */}
      <FreeTrialPlayer
        lesson={lesson}
        courseTitle={courseTitle}
        title={title}
        content={content}
        locale={locale}
      />
    </main>
  )
}