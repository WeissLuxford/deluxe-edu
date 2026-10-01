import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { Button } from '@/design/components/Button'
import { LessonView, type Step } from '@/features/lesson/LessonView'
import { readQuestions } from '@/features/quiz/questions'
import s from '@/features/lesson/trial.module.css'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ lesson?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'lessonFlow' })
  return { title: `${t('trialBadge')} — Highgate` }
}

// The trial lesson is the same lesson view a student gets, minus progress
// tracking: steps come from the lesson's flags, everything is edited in admin.
export default async function TrialLessonPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { lesson: requested } = await searchParams

  const course = await prisma.course.findUnique({
    where: { slug: 'trial-lesson' },
    include: { lessons: { orderBy: { order: 'asc' }, include: { Assignment: { take: 1, select: { prompt: true } } } } }
  })
  if (!course || course.lessons.length === 0) notFound()

  const index = Math.max(0, course.lessons.findIndex(l => l.slug === requested))
  const lesson = course.lessons[index]
  const following = course.lessons[index + 1] ?? null
  const t = await getTranslations({ locale, namespace: 'lessonFlow' })
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  const questions = readQuestions(lesson.Assignment[0]?.prompt, locale)
  const content = localized(lesson.content, locale)
  const steps: Step[] = []
  if (lesson.hasVideo) steps.push('video')
  if (lesson.hasConspect && content.trim()) steps.push('conspect')
  if (lesson.hasTest && questions.length) steps.push('test')

  const nextHref = following ? `/${locale}/trial-lesson?lesson=${following.slug}` : `/${locale}/courses`

  return (
    <LessonView
      mode="trial"
      lesson={{
        id: lesson.id,
        slug: lesson.slug,
        title: localized(lesson.title, locale),
        content,
        videoUrl: lesson.videoUrl,
        index: index + 1,
        durationMin: lesson.durationMin,
        moduleTitle: t('trialBadge')
      }}
      steps={steps.length ? steps : ['conspect']}
      initialStep={null}
      questions={questions}
      assignmentId={null}
      alreadyPassed={false}
      teacherReviews={false}
      back={{ href: `/${locale}`, label: 'Highgate' }}
      next={{ href: nextHref, label: following ? t('nextTrial') : t('toCourses') }}
      trialEnd={
        following ? undefined : (
          <div className={s.end}>
            <span className={s.endTitle}>{t.rich('trialEndTitle', rich)}</span>
            <span className={s.endText}>{t('trialEndText')}</span>
            <span className={s.endActions}>
              <Button href={`/${locale}/courses`} variant="lime" size="lg" arrow>
                {t('toCourses')}
              </Button>
              <Button href={`/${locale}/level-test`} variant="ghostOnInk" size="lg">
                {t('toLevelTest')}
              </Button>
            </span>
          </div>
        )
      }
    />
  )
}
