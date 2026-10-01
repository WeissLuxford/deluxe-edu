import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isHardGated } from '@/features/learn/groupGate'
import { getCourseTree } from '@/features/learn/progress'
import { ExamView } from '@/features/lesson/ExamView'
import { readQuestions } from '@/features/quiz/questions'

type Props = { params: Promise<{ locale: string; slug: string; moduleId: string }> }

export default async function ModuleExamPage({ params }: Props) {
  const { locale, slug, moduleId } = await params
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const tree = await getCourseTree(userId, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  const mod = tree.modules.find(m => m.id === moduleId)
  if (!mod?.exam) notFound()
  if (!(mod.total > 0 && mod.done === mod.total)) redirect(`/${locale}/learn/${slug}`)

  const [exam, prior, hardGated] = await Promise.all([
    prisma.exam.findUnique({ where: { id: mod.exam.id }, select: { id: true, prompt: true, passingScore: true } }),
    prisma.examAttempt.findFirst({
      where: { examId: mod.exam.id, userId },
      orderBy: { submittedAt: 'desc' },
      select: { grade: true, correct: true, total: true, reviewStatus: true, reviewNote: true }
    }),
    isHardGated(userId)
  ])
  if (!exam) notFound()

  return (
    <ExamView
      examId={exam.id}
      title={mod.exam.title}
      moduleTitle={mod.title}
      passingScore={exam.passingScore}
      questions={readQuestions(exam.prompt, locale)}
      hardGated={hardGated}
      prior={
        prior
          ? { grade: prior.grade, correct: prior.correct, total: prior.total, passed: prior.grade >= exam.passingScore, reviewStatus: prior.reviewStatus, note: prior.reviewNote }
          : null
      }
      courseHref={`/${locale}/learn/${slug}`}
    />
  )
}
