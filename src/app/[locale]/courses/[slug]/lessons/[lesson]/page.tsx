import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTranslations } from 'next-intl/server'

export default async function LessonPage({
  params
}: {
  params: Promise<{ locale: string; slug: string; lesson: string }>
}) {
  const { locale, slug, lesson } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect(`/${locale}/signin`)

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect(`/${locale}/signin`)

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (!course) notFound()

  const current = course.lessons.find(l => l.slug === lesson)
  if (!current) notFound()

  const enroll = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: course.id, status: 'ACTIVE' } })
  if (!enroll) redirect(`/${locale}/courses/${slug}`)

  const idx = course.lessons.findIndex(l => l.id === current.id)
  const hasPrev = idx > 0
  let canEnter = true
  if (hasPrev) {
    const prev = course.lessons[idx - 1]
    const prevProgress = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: prev.id } } })
    canEnter = Boolean(prevProgress?.passed)
  }

  const tt = current.title as any
  const title = tt?.[locale] ?? tt?.ru ?? tt?.en ?? tt?.uz ?? current.slug

  const nextLesson = course.lessons[idx + 1]
  const lessonsHref = `/${locale}/courses/${slug}`
  const summaryHref = `/${locale}/courses/${slug}/lessons/${lesson}/summary`

  if (!canEnter) {
    const prev = course.lessons[idx - 1]
    const pt = prev.title as any
    const prevTitle = pt?.[locale] ?? pt?.ru ?? pt?.en ?? pt?.uz ?? prev.slug
    return (
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold">{t('lesson.locked')}</h1>
        <p>{t('lesson.completePrev')}: {prevTitle}</p>
        <div className="flex gap-3">
          <Link href={`/${locale}/courses/${slug}/lessons/${prev.slug}`} className="px-4 py-2 rounded border">{t('buttons.back')}</Link>
          <Link href={lessonsHref} className="px-4 py-2 rounded bg-black text-white">{t('lesson.backToCourseLessons')}</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="opacity-80">{t('lesson.videoPlaceholder')}</p>
      </div>

      <div className="flex gap-3">
        <Link href={lessonsHref} className="px-4 py-2 rounded border">{t('buttons.backToLessons')}</Link>
        <Link href={summaryHref} className="px-4 py-2 rounded bg-black text-white">{t('buttons.next')}</Link>
      </div>

      {nextLesson ? (
        <div className="opacity-70 text-sm">{t('lesson.nextLesson')}: {(nextLesson.title as any)?.[locale] ?? (nextLesson.title as any)?.ru ?? nextLesson.slug}</div>
      ) : (
        <div className="opacity-70 text-sm">{t('lesson.lastLesson')}</div>
      )}
    </main>
  )
}
