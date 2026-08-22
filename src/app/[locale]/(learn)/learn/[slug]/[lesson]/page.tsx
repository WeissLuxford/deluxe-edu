import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCourseTree, findLesson, type LessonStep } from '@/features/learn/progress'
import { LessonPlayer } from '@/features/courses/components/LessonPlayer'
import { assertWithinDailyLimit } from '@/features/courses/dailyLimit'

const STEPS: LessonStep[] = ['video', 'conspect', 'test', 'dialogue']

export default async function LearnLessonPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; slug: string; lesson: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const { locale, slug, lesson: lessonSlug } = await params
  const { step } = await searchParams

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect(`/${locale}/signin?next=/${locale}/learn/${slug}/${lessonSlug}`)
  }

  const tree = await getCourseTree(session.user.id, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  const found = findLesson(tree, lessonSlug)
  if (!found) notFound()
  if (found.lesson.status === 'locked') redirect(`/${locale}/learn/${slug}`)

  const limit = await assertWithinDailyLimit(session.user.id, found.lesson.id)
  if (!limit.allowed) redirect(`/${locale}/learn/${slug}?limitReached=1`)

  const lesson = await prisma.lesson.findUnique({ where: { id: found.lesson.id } })
  if (!lesson) notFound()

  const assignment = lesson.hasTest
    ? await prisma.assignment.findFirst({
        where: { lessonId: lesson.id },
        select: { id: true, title: true, prompt: true }
      })
    : null

  let dialogue = null
  if (lesson.hasDialogue) {
    const dialogueRow = await prisma.dialogue.findFirst({
      where: { lessonId: lesson.id },
      select: { id: true, title: true, characters: true, lines: true }
    })

    if (dialogueRow) {
      const attempt = await prisma.dialogueAttempt.findFirst({
        where: { dialogueId: dialogueRow.id, userId: session.user.id },
        orderBy: { startedAt: 'desc' },
        include: { recordings: { select: { lineId: true, audioUrl: true } } }
      })

      dialogue = {
        id: dialogueRow.id,
        title: dialogueRow.title,
        characters: dialogueRow.characters,
        lines: dialogueRow.lines,
        attemptId: attempt?.id ?? null,
        characterId: attempt?.characterId ?? null,
        status: attempt?.status ?? null,
        recordings: Object.fromEntries((attempt?.recordings ?? []).map(r => [r.lineId, r.audioUrl]))
      }
    }
  }

  const flat = tree.modules.flatMap(m => m.lessons)
  const position = flat.findIndex(l => l.id === lesson.id)
  const nextLesson = flat[position + 1] ?? null

  const requestedStep = STEPS.includes(step as LessonStep) ? (step as LessonStep) : null
  const initialStep = requestedStep ?? found.lesson.lastStep

  return (
    <LessonPlayer
      lesson={lesson}
      courseSlug={tree.slug}
      moduleTitle={found.module.title}
      lessonIndex={found.lesson.index}
      assignment={assignment}
      dialogue={dialogue}
      progress={{ watched: found.lesson.watched, passed: found.lesson.passed }}
      nextLessonSlug={nextLesson?.slug ?? null}
      initialStep={initialStep}
      enrollmentPlan={tree.plan}
      locale={locale}
    />
  )
}
