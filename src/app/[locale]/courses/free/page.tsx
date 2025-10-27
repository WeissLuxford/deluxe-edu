import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function FreeLessonPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'common' })

  const demoLesson = await prisma.lesson.findFirst({
    where: { content: { path: ['isDemo'], equals: true } }, // если демо помечен в JSON
    include: { course: true }
  })

  if (!demoLesson) notFound()

  const title = (demoLesson.title as any)?.[locale] ?? demoLesson.slug
  const courseSlug = demoLesson.course.slug
  const nextHref = `/${locale}/courses`

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold">{t('demoLesson.title', { default: 'Free Lesson' })}</h1>
        <p className="opacity-80">{t('demoLesson.desc', { default: 'Try a real lesson before joining the course' })}</p>
      </div>

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="aspect-video bg-black flex items-center justify-center text-white opacity-80">
          <span>{title} — demo video</span>
        </div>
      </div>

      <div className="text-center">
        <Link href={nextHref}
          className="px-6 py-3 rounded-full font-medium"
          style={{ background: 'var(--gold)', color: 'black' }}>
          Continue to full course
        </Link>
      </div>
    </main>
  )
}
