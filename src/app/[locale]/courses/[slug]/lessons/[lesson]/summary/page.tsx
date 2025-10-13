import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTranslations } from 'next-intl/server'

export default async function SummaryPage({
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
  if (idx > 0) {
    const prev = course.lessons[idx - 1]
    const prevProgress = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: prev.id } } })
    if (!prevProgress?.passed) redirect(`/${locale}/courses/${slug}/lessons/${prev.slug}`)
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: current.id } },
    update: { watched: true },
    create: { userId: user.id, lessonId: current.id, watched: true }
  })

  const ct = current.title as any
  const title = ct?.[locale] ?? ct?.ru ?? ct?.en ?? ct?.uz ?? current.slug
  const backHref = `/${locale}/courses/${slug}/lessons/${lesson}`
  const taskHref = `/${locale}/courses/${slug}/lessons/${lesson}/assignment`

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">{t('summary.title')}: {title}</h1>
      <div className="opacity-80 leading-relaxed">{t('summary.desc')}</div>
      <div className="flex gap-3">
        <Link href={backHref} className="px-4 py-2 rounded border">{t('lesson.backToVideo')}</Link>
        <Link href={taskHref} className="px-4 py-2 rounded bg-black text-white">{t('buttons.assignment')}</Link>
      </div>
    </main>
  )
}
