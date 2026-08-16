import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LevelTestPage({ params }: Props) {
  const { locale } = await params
  const tFree = await getTranslations({ locale, namespace: 'free' })

  const course = await prisma.course.findUnique({
    where: { slug: 'level-test' },
    include: {
      lessons: { orderBy: { order: 'asc' } }
    }
  })

  if (!course) notFound()

  const firstLesson = course.lessons[0]

  return (
    <main className="page-start py-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
            English Level Test
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--muted)' }}>
            Find your English level in 15 minutes
          </p>

          <div className="grid gap-3 text-sm mb-8" style={{ color: 'var(--muted)' }}>
            <div>{tFree('instantResults')}</div>
            <div>{tFree('detailedReport')}</div>
            <div>{tFree('courseAdvice')}</div>
          </div>

          {firstLesson ? (
            <Link
              href={`/${locale}/level-test/${firstLesson.slug}`}
              className="btn btn-primary"
              style={{ background: 'var(--gold)', color: 'var(--bg)' }}
            >
              Start Test
            </Link>
          ) : (
            <div style={{ color: 'var(--muted)' }}>{tFree('noLessons')}</div>
          )}
        </div>
      </div>
    </main>
  )
}