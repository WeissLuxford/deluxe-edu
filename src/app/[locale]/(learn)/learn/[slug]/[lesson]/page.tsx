import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { assertWithinDailyLimit } from '@/features/courses/dailyLimit'
import { findLesson, getCourseTree, type LessonStep } from '@/features/learn/progress'
import { LessonView } from '@/features/lesson/LessonView'
import { readQuestions } from '@/features/quiz/questions'

const STEPS: LessonStep[] = ['video', 'conspect', 'test']

type Props = {
  params: Promise<{ locale: string; slug: string; lesson: string }>
  searchParams: Promise<{ step?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug, lesson: lessonSlug } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return {}
  const tree = await getCourseTree(session.user.id, slug, locale)
  const found = tree ? findLesson(tree, lessonSlug) : null
  return found ? { title: `${found.lesson.title} — Highgate` } : {}
}

export default async function LessonPage({ params, searchParams }: Props) {
  const { locale, slug, lesson: lessonSlug } = await params
  const { step } = await searchParams
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const tree = await getCourseTree(userId, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  const found = findLesson(tree, lessonSlug)
  if (!found) notFound()
  if (found.lesson.status === 'locked') redirect(`/${locale}/learn/${slug}`)

  const limit = await assertWithinDailyLimit(userId, found.lesson.id)
  if (!limit.allowed) redirect(`/${locale}/learn/${slug}?limitReached=1`)

  const [lesson, assignment, t] = await Promise.all([
    prisma.lesson.findUnique({ where: { id: found.lesson.id }, select: { id: true, slug: true, title: true, content: true, videoUrl: true, durationMin: true } }),
    prisma.assignment.findFirst({ where: { lessonId: found.lesson.id }, select: { id: true, prompt: true } }),
    getTranslations({ locale, namespace: 'lessonFlow' })
  ])
  if (!lesson) notFound()

  const steps = found.lesson.steps.filter(s => s !== 'test' || assignment)
  const flat = tree.modules.flatMap(m => m.lessons)
  const following = flat[flat.findIndex(l => l.id === lesson.id) + 1] ?? null
  const requested = STEPS.includes(step as LessonStep) ? (step as LessonStep) : null

  return (
    <LessonView
      mode="learn"
      lesson={{
        id: lesson.id,
        slug: lesson.slug,
        title: localized(lesson.title, locale),
        content: localized(lesson.content, locale),
        videoUrl: lesson.videoUrl,
        index: found.lesson.index,
        durationMin: lesson.durationMin,
        moduleTitle: found.module.title
      }}
      steps={steps.length ? steps : ['conspect']}
      initialStep={requested ?? found.lesson.lastStep}
      questions={assignment ? readQuestions(assignment.prompt, locale) : []}
      assignmentId={assignment?.id ?? null}
      alreadyPassed={found.lesson.passed}
      teacherReviews={tree.plan === 'PRO' || tree.plan === 'DELUXE'}
      back={{ href: `/${locale}/learn/${slug}`, label: tree.title }}
      next={
        following
          ? { href: `/${locale}/learn/${slug}/${following.slug}`, label: t('nextLesson') }
          : { href: `/${locale}/learn/${slug}`, label: t('toCourse') }
      }
    />
  )
}
