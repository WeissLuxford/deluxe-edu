// src/app/[locale]/free-mock-test/[lesson]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { FreeMockTestPlayer } from '@/features/courses/components/FreeMockTestPlayer'

type Props = {
  params: Promise<{ locale: string; lesson: string }>
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

export default async function FreeMockTestLessonPage({ params }: Props) {
  const { locale, lesson: lessonSlug } = await params

  const course = await prisma.course.findUnique({
    where: { slug: 'free-mock-test-online' },
    include: {
      lessons: { 
        orderBy: { order: 'asc' },
        include: {
          Assignment: true
        }
      }
    }
  })

  if (!course) notFound()

  const lesson = course.lessons.find(l => l.slug === lessonSlug)
  if (!lesson) notFound()

  const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id)
  const nextLesson = course.lessons[lessonIndex + 1]
  const assignment = lesson.Assignment[0] || null

  const title = getLocalizedText(lesson.title, locale)

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
              <div className="badge badge-success mb-1">FREE MOCK TEST</div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{title}</h1>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Section {lessonIndex + 1} of {course.lessons.length}
              </div>
            </div>

            <div className="w-32" />
          </div>

          {/* Progress */}
          <div className="progress" style={{ height: '4px', marginBottom: 0 }}>
            <div className="progress-bar" style={{ width: `${((lessonIndex + 1) / course.lessons.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* Content */}
      <FreeMockTestPlayer
        lesson={lesson}
        assignment={assignment}
        nextLesson={nextLesson}
        locale={locale}
        totalLessons={course.lessons.length}
        currentIndex={lessonIndex}
      />
    </main>
  )
}